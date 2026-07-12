import { eq, and, lt, inArray, asc, desc, count, gte, lte, SQL } from "drizzle-orm";
import { aliasedTable } from "drizzle-orm";
import { db } from "../../../db/index.js";
import {
  assetAllocation,
  transferRequest,
  asset,
  user,
  department,
} from "../../../db/schema/index.js";
import type { AllocationStatus, TransferRequestStatus } from "../types/index.js";
import type { AllocationQueryInput, TransferQueryInput } from "../validators/allocation.validator.js";

const generateId = () => crypto.randomUUID();

export const allocationRepository = {
  // ── Allocations ────────────────────────────────────────────────────────────

  async findById(id: string) {
    const rows = await db.select().from(assetAllocation).where(eq(assetAllocation.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async findActiveByAsset(assetId: string) {
    const rows = await db
      .select()
      .from(assetAllocation)
      .where(
        and(
          eq(assetAllocation.assetId, assetId),
          inArray(assetAllocation.status, ["ACTIVE", "RETURN_REQUESTED", "TRANSFER_PENDING", "OVERDUE"])
        )
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async findAll(query: AllocationQueryInput) {
    const {
      assetId,
      employeeId,
      departmentId,
      status,
      expectedReturnDateFrom,
      expectedReturnDateTo,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    const employee = aliasedTable(user, "employee");

    const conditions: SQL[] = [];
    if (assetId) conditions.push(eq(assetAllocation.assetId, assetId));
    if (employeeId) conditions.push(eq(assetAllocation.employeeId, employeeId));
    if (departmentId) conditions.push(eq(assetAllocation.departmentId, departmentId));
    if (status) conditions.push(eq(assetAllocation.status, status));
    if (expectedReturnDateFrom)
      conditions.push(gte(assetAllocation.expectedReturnDate, new Date(expectedReturnDateFrom)));
    if (expectedReturnDateTo)
      conditions.push(lte(assetAllocation.expectedReturnDate, new Date(expectedReturnDateTo)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumn = {
      allocatedAt: assetAllocation.allocatedAt,
      expectedReturnDate: assetAllocation.expectedReturnDate,
      status: assetAllocation.status,
      createdAt: assetAllocation.createdAt,
    }[sortBy];

    const orderBy = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);
    const offset = (page - 1) * limit;

    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select({
          allocation: assetAllocation,
          assetTag: asset.assetTag,
          assetName: asset.name,
          employeeName: employee.name,
          employeeEmail: employee.email,
          departmentName: department.name,
        })
        .from(assetAllocation)
        .leftJoin(asset, eq(assetAllocation.assetId, asset.id))
        .leftJoin(employee, eq(assetAllocation.employeeId, employee.id))
        .leftJoin(department, eq(assetAllocation.departmentId, department.id))
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(assetAllocation).where(where),
    ]);

    return { rows, total: Number(total) };
  },

  async findByEmployee(employeeId: string, query: AllocationQueryInput) {
    const withEmployee = { ...query, employeeId };
    return this.findAll(withEmployee);
  },

  async findOverdue() {
    const now = new Date();
    const employee = aliasedTable(user, "employee");

    return db
      .select({
        allocation: assetAllocation,
        assetTag: asset.assetTag,
        assetName: asset.name,
        employeeName: employee.name,
        employeeEmail: employee.email,
        departmentName: department.name,
      })
      .from(assetAllocation)
      .leftJoin(asset, eq(assetAllocation.assetId, asset.id))
      .leftJoin(employee, eq(assetAllocation.employeeId, employee.id))
      .leftJoin(department, eq(assetAllocation.departmentId, department.id))
      .where(
        and(
          inArray(assetAllocation.status, ["ACTIVE", "OVERDUE"]),
          lt(assetAllocation.expectedReturnDate, now)
        )
      )
      .orderBy(asc(assetAllocation.expectedReturnDate));
  },

  // Marks ACTIVE allocations past their expectedReturnDate as OVERDUE
  async markOverdue(): Promise<number> {
    const now = new Date();
    const rows = await db
      .select({ id: assetAllocation.id })
      .from(assetAllocation)
      .where(
        and(
          eq(assetAllocation.status, "ACTIVE"),
          lt(assetAllocation.expectedReturnDate, now)
        )
      );

    if (rows.length === 0) return 0;

    await db
      .update(assetAllocation)
      .set({ status: "OVERDUE", updatedAt: new Date() })
      .where(
        inArray(
          assetAllocation.id,
          rows.map((r) => r.id)
        )
      );

    return rows.length;
  },

  async create(data: {
    assetId: string;
    employeeId: string;
    departmentId: string;
    allocatedBy: string;
    expectedReturnDate?: Date | null;
  }) {
    const now = new Date();
    const [created] = await db
      .insert(assetAllocation)
      .values({
        id: generateId(),
        assetId: data.assetId,
        employeeId: data.employeeId,
        departmentId: data.departmentId,
        allocatedBy: data.allocatedBy,
        allocatedAt: now,
        expectedReturnDate: data.expectedReturnDate ?? null,
        returnedAt: null,
        returnCondition: null,
        returnNotes: null,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  },

  async updateStatus(id: string, status: AllocationStatus) {
    const [updated] = await db
      .update(assetAllocation)
      .set({ status, updatedAt: new Date() })
      .where(eq(assetAllocation.id, id))
      .returning();
    return updated;
  },

  async approveReturn(
    id: string,
    data: { returnCondition: string; returnNotes?: string | null }
  ) {
    const [updated] = await db
      .update(assetAllocation)
      .set({
        status: "RETURNED",
        returnedAt: new Date(),
        returnCondition: data.returnCondition as typeof assetAllocation.$inferInsert["returnCondition"],
        returnNotes: data.returnNotes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(assetAllocation.id, id))
      .returning();
    return updated;
  },

  // ── Transfer Requests ──────────────────────────────────────────────────────

  async findTransferById(id: string) {
    const rows = await db
      .select()
      .from(transferRequest)
      .where(eq(transferRequest.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async findPendingTransferByAsset(assetId: string) {
    const rows = await db
      .select()
      .from(transferRequest)
      .where(
        and(eq(transferRequest.assetId, assetId), eq(transferRequest.status, "PENDING"))
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async findTransfers(query: TransferQueryInput) {
    const { assetId, requestedBy, status, page, limit } = query;

    const requester = aliasedTable(user, "requester");
    const currentHolder = aliasedTable(user, "current_holder");

    const conditions: SQL[] = [];
    if (assetId) conditions.push(eq(transferRequest.assetId, assetId));
    if (requestedBy) conditions.push(eq(transferRequest.requestedBy, requestedBy));
    if (status) conditions.push(eq(transferRequest.status, status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;

    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select({
          transfer: transferRequest,
          assetTag: asset.assetTag,
          assetName: asset.name,
          requesterName: requester.name,
          currentHolderName: currentHolder.name,
        })
        .from(transferRequest)
        .leftJoin(asset, eq(transferRequest.assetId, asset.id))
        .leftJoin(requester, eq(transferRequest.requestedBy, requester.id))
        .leftJoin(currentHolder, eq(transferRequest.currentHolderId, currentHolder.id))
        .where(where)
        .orderBy(desc(transferRequest.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(transferRequest).where(where),
    ]);

    return { rows, total: Number(total) };
  },

  async createTransfer(data: {
    assetId: string;
    requestedBy: string;
    currentHolderId: string;
    requestedEmployeeId?: string | null;
    requestedDepartmentId?: string | null;
    reason?: string | null;
  }) {
    const now = new Date();
    const [created] = await db
      .insert(transferRequest)
      .values({
        id: generateId(),
        assetId: data.assetId,
        requestedBy: data.requestedBy,
        currentHolderId: data.currentHolderId,
        requestedEmployeeId: data.requestedEmployeeId ?? null,
        requestedDepartmentId: data.requestedDepartmentId ?? null,
        reason: data.reason ?? null,
        status: "PENDING",
        approvedBy: null,
        approvedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  },

  async updateTransferStatus(
    id: string,
    status: TransferRequestStatus,
    approvedBy?: string
  ) {
    const [updated] = await db
      .update(transferRequest)
      .set({
        status,
        approvedBy: approvedBy ?? null,
        approvedAt: approvedBy ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(transferRequest.id, id))
      .returning();
    return updated;
  },
};
