import { eq, and, gte, lte, inArray, asc, desc, count, SQL } from "drizzle-orm";
import { aliasedTable } from "drizzle-orm";
import { db } from "../../../db/index.js";
import {
  maintenanceRequest,
  maintenanceAttachment,
  asset,
  user,
  department,
} from "../../../db/schema/index.js";
import type { MaintenanceQueryInput } from "../validators/maintenance.validator.js";
import { ACTIVE_MAINTENANCE_STATUSES } from "../types/index.js";

const generateId = () => crypto.randomUUID();

export const maintenanceRepository = {
  async findById(id: string) {
    const reporter = aliasedTable(user, "maint_reporter");
    const technician = aliasedTable(user, "maint_technician");
    const approver = aliasedTable(user, "maint_approver");

    const rows = await db
      .select({
        request: maintenanceRequest,
        assetTag: asset.assetTag,
        assetName: asset.name,
        assetDepartmentId: asset.departmentId,
        reporterName: reporter.name,
        technicianName: technician.name,
        approverName: approver.name,
        departmentName: department.name,
      })
      .from(maintenanceRequest)
      .leftJoin(asset, eq(maintenanceRequest.assetId, asset.id))
      .leftJoin(reporter, eq(maintenanceRequest.reportedBy, reporter.id))
      .leftJoin(technician, eq(maintenanceRequest.assignedTechnicianId, technician.id))
      .leftJoin(approver, eq(maintenanceRequest.approvedBy, approver.id))
      .leftJoin(department, eq(asset.departmentId, department.id))
      .where(eq(maintenanceRequest.id, id))
      .limit(1);

    return rows[0] ?? null;
  },

  async findRawById(id: string) {
    const rows = await db
      .select()
      .from(maintenanceRequest)
      .where(eq(maintenanceRequest.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async findActiveByAsset(assetId: string) {
    const rows = await db
      .select()
      .from(maintenanceRequest)
      .where(
        and(
          eq(maintenanceRequest.assetId, assetId),
          inArray(maintenanceRequest.status, ACTIVE_MAINTENANCE_STATUSES)
        )
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async findAll(query: MaintenanceQueryInput) {
    const {
      assetId,
      reportedBy,
      technicianId,
      priority,
      status,
      departmentId,
      createdFrom,
      createdTo,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    const reporter = aliasedTable(user, "maint_reporter");
    const technician = aliasedTable(user, "maint_technician");

    const conditions: SQL[] = [];
    if (assetId) conditions.push(eq(maintenanceRequest.assetId, assetId));
    if (reportedBy) conditions.push(eq(maintenanceRequest.reportedBy, reportedBy));
    if (technicianId) conditions.push(eq(maintenanceRequest.assignedTechnicianId, technicianId));
    if (priority) conditions.push(eq(maintenanceRequest.priority, priority));
    if (status) conditions.push(eq(maintenanceRequest.status, status));
    if (departmentId) conditions.push(eq(asset.departmentId, departmentId));
    if (createdFrom) conditions.push(gte(maintenanceRequest.createdAt, new Date(createdFrom)));
    if (createdTo) conditions.push(lte(maintenanceRequest.createdAt, new Date(createdTo)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumn = {
      priority: maintenanceRequest.priority,
      status: maintenanceRequest.status,
      createdAt: maintenanceRequest.createdAt,
      updatedAt: maintenanceRequest.updatedAt,
    }[sortBy];

    const orderBy = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);
    const offset = (page - 1) * limit;

    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select({
          request: maintenanceRequest,
          assetTag: asset.assetTag,
          assetName: asset.name,
          assetDepartmentId: asset.departmentId,
          reporterName: reporter.name,
          technicianName: technician.name,
          departmentName: department.name,
        })
        .from(maintenanceRequest)
        .leftJoin(asset, eq(maintenanceRequest.assetId, asset.id))
        .leftJoin(reporter, eq(maintenanceRequest.reportedBy, reporter.id))
        .leftJoin(technician, eq(maintenanceRequest.assignedTechnicianId, technician.id))
        .leftJoin(department, eq(asset.departmentId, department.id))
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      // asset join required when filtering by departmentId
      db
        .select({ value: count() })
        .from(maintenanceRequest)
        .leftJoin(asset, eq(maintenanceRequest.assetId, asset.id))
        .where(where),
    ]);

    return { rows, total: Number(total) };
  },

  async create(data: {
    assetId: string;
    reportedBy: string;
    issueTitle: string;
    issueDescription: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }) {
    const now = new Date();
    const [created] = await db
      .insert(maintenanceRequest)
      .values({
        id: generateId(),
        assetId: data.assetId,
        reportedBy: data.reportedBy,
        assignedTechnicianId: null,
        issueTitle: data.issueTitle,
        issueDescription: data.issueDescription,
        priority: data.priority,
        status: "PENDING",
        approvalRemarks: null,
        resolutionNotes: null,
        approvedBy: null,
        approvedAt: null,
        resolvedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  },

  async update(id: string, values: Partial<typeof maintenanceRequest.$inferInsert>) {
    const [updated] = await db
      .update(maintenanceRequest)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(maintenanceRequest.id, id))
      .returning();
    return updated;
  },

  // ── Attachments ────────────────────────────────────────────────────────────

  async createAttachment(data: {
    maintenanceRequestId: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number | null;
    mimeType?: string | null;
    uploadedBy: string;
  }) {
    const [created] = await db
      .insert(maintenanceAttachment)
      .values({
        id: generateId(),
        maintenanceRequestId: data.maintenanceRequestId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize ?? null,
        mimeType: data.mimeType ?? null,
        uploadedBy: data.uploadedBy,
        createdAt: new Date(),
      })
      .returning();
    return created;
  },

  async findAttachmentById(id: string) {
    const rows = await db
      .select()
      .from(maintenanceAttachment)
      .where(eq(maintenanceAttachment.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async findAttachmentsByRequest(maintenanceRequestId: string) {
    return db
      .select()
      .from(maintenanceAttachment)
      .where(eq(maintenanceAttachment.maintenanceRequestId, maintenanceRequestId))
      .orderBy(asc(maintenanceAttachment.createdAt));
  },

  async deleteAttachment(id: string) {
    await db.delete(maintenanceAttachment).where(eq(maintenanceAttachment.id, id));
  },
};
