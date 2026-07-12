import { eq } from "drizzle-orm";
import { maintenanceRepository } from "../repositories/maintenance.repository.js";
import { assetRepository } from "../../assets/repositories/asset.repository.js";
import { storageService } from "../../assets/services/storage.service.js";
import { db } from "../../../db/index.js";
import { user, department } from "../../../db/schema/index.js";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
} from "../../../utils/errors.js";
import type {
  CreateMaintenanceRequestInput,
  ApproveRequestInput,
  RejectRequestInput,
  AssignTechnicianInput,
  ResolveMaintenanceInput,
  MaintenanceQueryInput,
} from "../validators/maintenance.validator.js";
import type { Role } from "../../../types/index.js";
import { ActivityLogger } from "../../activity/services/activity-logger.js";
import { NotificationService } from "../../activity/services/notification.service.js";
import type { NotificationPriority } from "../../activity/types/index.js";

export const maintenanceService = {
  async create(data: CreateMaintenanceRequestInput, reportedBy: string) {
    const foundAsset = await assetRepository.findById(data.assetId);
    if (!foundAsset) throw new NotFoundError("Asset not found");
    if (foundAsset.status === "UNDER_MAINTENANCE")
      throw new ConflictError("Asset is already under maintenance");

    const activeRequest = await maintenanceRepository.findActiveByAsset(data.assetId);
    if (activeRequest)
      throw new ConflictError(
        `Asset already has an active maintenance request (status: ${activeRequest.status})`
      );

    const created = await maintenanceRepository.create({
      assetId: data.assetId,
      reportedBy,
      issueTitle: data.issueTitle,
      issueDescription: data.issueDescription,
      priority: data.priority,
    });

    await assetRepository.createHistory({
      assetId: data.assetId,
      action: "MAINTENANCE_REQUESTED",
      performedBy: reportedBy,
      metadata: {
        maintenanceRequestId: created.id,
        issueTitle: data.issueTitle,
        priority: data.priority,
      },
    });

    NotificationService.send({
      userId: reportedBy,
      title: "Maintenance Request Submitted",
      message: `Your request "${data.issueTitle}" has been submitted and is pending review.`,
      type: "MAINTENANCE_REQUEST",
      priority: data.priority as NotificationPriority,
      referenceType: "maintenance",
      referenceId: created.id,
    });
    ActivityLogger.log({
      userId: reportedBy,
      module: "MAINTENANCE",
      action: "MAINTENANCE_REQUESTED",
      entityType: "maintenance",
      entityId: created.id,
      description: `Maintenance request "${data.issueTitle}" created for asset ${data.assetId}`,
      metadata: { assetId: data.assetId, maintenanceRequestId: created.id, priority: data.priority },
    });

    return created;
  },

  async approve(id: string, data: ApproveRequestInput, approverId: string) {
    const request = await maintenanceRepository.findRawById(id);
    if (!request) throw new NotFoundError("Maintenance request not found");
    if (request.status !== "PENDING")
      throw new ValidationError(`Cannot approve a request with status "${request.status}"`);

    const [updated] = await Promise.all([
      maintenanceRepository.update(id, {
        status: "APPROVED",
        approvedBy: approverId,
        approvedAt: new Date(),
        approvalRemarks: data.approvalRemarks ?? null,
      }),
      assetRepository.update(request.assetId, { status: "UNDER_MAINTENANCE" }),
    ]);

    await assetRepository.createHistory({
      assetId: request.assetId,
      action: "MAINTENANCE_APPROVED",
      performedBy: approverId,
      metadata: {
        maintenanceRequestId: id,
        approvalRemarks: data.approvalRemarks ?? null,
      },
    });

    NotificationService.send({
      userId: request.reportedBy,
      title: "Maintenance Request Approved",
      message: `Your maintenance request has been approved and the asset is now under maintenance.${data.approvalRemarks ? ` Note: ${data.approvalRemarks}` : ""}`,
      type: "MAINTENANCE_APPROVED",
      priority: "MEDIUM",
      referenceType: "maintenance",
      referenceId: id,
    });
    ActivityLogger.log({
      userId: approverId,
      module: "MAINTENANCE",
      action: "MAINTENANCE_APPROVED",
      entityType: "maintenance",
      entityId: id,
      description: `Maintenance request ${id} approved`,
      metadata: { maintenanceRequestId: id, approvalRemarks: data.approvalRemarks ?? null },
    });

    return updated;
  },

  async reject(id: string, data: RejectRequestInput, rejectedBy: string) {
    const request = await maintenanceRepository.findRawById(id);
    if (!request) throw new NotFoundError("Maintenance request not found");
    if (request.status !== "PENDING")
      throw new ValidationError(`Cannot reject a request with status "${request.status}"`);

    const updated = await maintenanceRepository.update(id, {
      status: "REJECTED",
      approvalRemarks: data.approvalRemarks ?? null,
    });

    NotificationService.send({
      userId: request.reportedBy,
      title: "Maintenance Request Rejected",
      message: `Your maintenance request has been rejected.${data.approvalRemarks ? ` Reason: ${data.approvalRemarks}` : ""}`,
      type: "MAINTENANCE_REJECTED",
      priority: "MEDIUM",
      referenceType: "maintenance",
      referenceId: id,
    });
    ActivityLogger.log({
      userId: rejectedBy,
      module: "MAINTENANCE",
      action: "MAINTENANCE_REJECTED",
      entityType: "maintenance",
      entityId: id,
      description: `Maintenance request ${id} rejected`,
      metadata: { maintenanceRequestId: id, approvalRemarks: data.approvalRemarks ?? null },
    });

    return updated;
  },

  async assignTechnician(id: string, data: AssignTechnicianInput, assignedBy: string) {
    const request = await maintenanceRepository.findRawById(id);
    if (!request) throw new NotFoundError("Maintenance request not found");
    if (request.status !== "APPROVED")
      throw new ValidationError(
        `Cannot assign technician to a request with status "${request.status}"`
      );

    const techRows = await db
      .select({ id: user.id, name: user.name, status: user.status })
      .from(user)
      .where(eq(user.id, data.technicianId))
      .limit(1);

    if (!techRows[0]) throw new NotFoundError("Technician not found");
    if (techRows[0].status === "INACTIVE")
      throw new ValidationError("Technician account is inactive");

    const updated = await maintenanceRepository.update(id, {
      status: "TECHNICIAN_ASSIGNED",
      assignedTechnicianId: data.technicianId,
    });

    await assetRepository.createHistory({
      assetId: request.assetId,
      action: "TECHNICIAN_ASSIGNED",
      performedBy: assignedBy,
      metadata: {
        maintenanceRequestId: id,
        technicianId: data.technicianId,
        technicianName: techRows[0].name,
      },
    });

    return updated;
  },

  async start(id: string, startedBy: string) {
    const request = await maintenanceRepository.findRawById(id);
    if (!request) throw new NotFoundError("Maintenance request not found");
    if (request.status !== "TECHNICIAN_ASSIGNED")
      throw new ValidationError(
        `Cannot start maintenance for a request with status "${request.status}"`
      );

    const updated = await maintenanceRepository.update(id, { status: "IN_PROGRESS" });

    await assetRepository.createHistory({
      assetId: request.assetId,
      action: "MAINTENANCE_STARTED",
      performedBy: startedBy,
      metadata: { maintenanceRequestId: id },
    });

    return updated;
  },

  async resolve(id: string, data: ResolveMaintenanceInput, resolvedBy: string) {
    const request = await maintenanceRepository.findRawById(id);
    if (!request) throw new NotFoundError("Maintenance request not found");
    if (request.status !== "IN_PROGRESS")
      throw new ValidationError(`Cannot resolve a request with status "${request.status}"`);

    const [updated] = await Promise.all([
      maintenanceRepository.update(id, {
        status: "RESOLVED",
        resolutionNotes: data.resolutionNotes ?? null,
        resolvedAt: new Date(),
      }),
      assetRepository.update(request.assetId, { status: "AVAILABLE" }),
    ]);

    await assetRepository.createHistory({
      assetId: request.assetId,
      action: "MAINTENANCE_RESOLVED",
      performedBy: resolvedBy,
      metadata: {
        maintenanceRequestId: id,
        resolutionNotes: data.resolutionNotes ?? null,
      },
    });

    NotificationService.send({
      userId: request.reportedBy,
      title: "Maintenance Completed",
      message: `Your maintenance request has been resolved and the asset is available again.${data.resolutionNotes ? ` Notes: ${data.resolutionNotes}` : ""}`,
      type: "MAINTENANCE_COMPLETED",
      priority: "LOW",
      referenceType: "maintenance",
      referenceId: id,
    });
    ActivityLogger.log({
      userId: resolvedBy,
      module: "MAINTENANCE",
      action: "MAINTENANCE_RESOLVED",
      entityType: "maintenance",
      entityId: id,
      description: `Maintenance request ${id} resolved`,
      metadata: { maintenanceRequestId: id, resolutionNotes: data.resolutionNotes ?? null },
    });

    return updated;
  },

  async getById(id: string, requesterId: string, requesterRole: Role) {
    const found = await maintenanceRepository.findById(id);
    if (!found) throw new NotFoundError("Maintenance request not found");

    await this._assertCanView(found, requesterId, requesterRole);

    const attachments = await maintenanceRepository.findAttachmentsByRequest(id);
    return { ...found, attachments };
  },

  async getAll(query: MaintenanceQueryInput, requesterId: string, requesterRole: Role) {
    const scopedQuery = await this._scopeQuery(query, requesterId, requesterRole);
    const { rows, total } = await maintenanceRepository.findAll(scopedQuery);
    const totalPages = Math.ceil(total / query.limit);
    return {
      data: rows,
      meta: { total, page: query.page, limit: query.limit, totalPages },
    };
  },

  async uploadAttachment(
    id: string,
    file: Express.Multer.File,
    uploadedBy: string,
    uploaderRole: Role
  ) {
    const request = await maintenanceRepository.findRawById(id);
    if (!request) throw new NotFoundError("Maintenance request not found");

    if (uploaderRole === "EMPLOYEE" && request.reportedBy !== uploadedBy)
      throw new ForbiddenError("You can only upload attachments to your own requests");

    const path = `maintenance/${id}/${Date.now()}-${file.originalname}`;
    const fileUrl = await storageService.uploadFile(path, file.buffer, file.mimetype);

    return maintenanceRepository.createAttachment({
      maintenanceRequestId: id,
      fileName: file.originalname,
      fileUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy,
    });
  },

  async deleteAttachment(requestId: string, attachmentId: string) {
    const attachment = await maintenanceRepository.findAttachmentById(attachmentId);
    if (!attachment) throw new NotFoundError("Attachment not found");
    if (attachment.maintenanceRequestId !== requestId)
      throw new NotFoundError("Attachment does not belong to this request");

    const path = storageService.extractPath(attachment.fileUrl);
    await storageService.deleteFile(path);
    await maintenanceRepository.deleteAttachment(attachmentId);
  },

  // ── Internal helpers ───────────────────────────────────────────────────────

  async _assertCanView(
    found: { request: { reportedBy: string }; assetDepartmentId: string | null },
    requesterId: string,
    requesterRole: Role
  ) {
    if (requesterRole === "ADMIN" || requesterRole === "ASSET_MANAGER") return;

    if (requesterRole === "DEPARTMENT_HEAD") {
      const deptRows = await db
        .select({ id: department.id })
        .from(department)
        .where(eq(department.departmentHeadId, requesterId))
        .limit(1);
      if (deptRows[0] && found.assetDepartmentId === deptRows[0].id) return;
      throw new ForbiddenError("Asset does not belong to your department");
    }

    // EMPLOYEE: own requests only
    if (found.request.reportedBy !== requesterId)
      throw new ForbiddenError("You can only view your own maintenance requests");
  },

  async _scopeQuery(
    query: MaintenanceQueryInput,
    requesterId: string,
    requesterRole: Role
  ): Promise<MaintenanceQueryInput> {
    if (requesterRole === "ADMIN" || requesterRole === "ASSET_MANAGER") return query;

    if (requesterRole === "DEPARTMENT_HEAD") {
      const deptRows = await db
        .select({ id: department.id })
        .from(department)
        .where(eq(department.departmentHeadId, requesterId))
        .limit(1);
      // Force-scope to this dept; if no dept assigned, use a non-matching sentinel
      const deptId = deptRows[0]?.id ?? "__NO_DEPT__";
      return { ...query, departmentId: deptId };
    }

    // EMPLOYEE: force-scope to own requests
    return { ...query, reportedBy: requesterId };
  },
};
