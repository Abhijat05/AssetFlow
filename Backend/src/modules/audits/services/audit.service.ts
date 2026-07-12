import { eq } from "drizzle-orm";
import { auditRepository } from "../repositories/audit.repository.js";
import { assetRepository } from "../../assets/repositories/asset.repository.js";
import { db } from "../../../db/index.js";
import { user, department, assetHistory } from "../../../db/schema/index.js";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
} from "../../../utils/errors.js";
import type {
  CreateAuditCycleInput,
  UpdateAuditCycleInput,
  AssignAuditorsInput,
  VerifyAssetInput,
  AuditQueryInput,
} from "../validators/audit.validator.js";
import type { AuditStatus } from "../types/index.js";
import type { Role } from "../../../types/index.js";

const generateId = () => crypto.randomUUID();

export const auditService = {
  async create(data: CreateAuditCycleInput, createdBy: string) {
    // Validate department exists when scoped to one
    if (data.scopeType === "DEPARTMENT") {
      const deptRows = await db
        .select({ id: department.id, status: department.status })
        .from(department)
        .where(eq(department.id, data.departmentId!))
        .limit(1);
      if (!deptRows[0]) throw new NotFoundError("Department not found");
      if (deptRows[0].status === "INACTIVE")
        throw new ValidationError("Department is inactive");
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    const cycle = await auditRepository.createCycle({
      name: data.name,
      description: data.description,
      scopeType: data.scopeType,
      departmentId: data.departmentId,
      location: data.location,
      startDate,
      endDate,
      createdBy,
    });

    // Auto-populate audit records for all assets in scope
    const scopeValue =
      data.scopeType === "DEPARTMENT"
        ? data.departmentId
        : data.scopeType === "LOCATION"
          ? data.location
          : null;

    const assets = await auditRepository.findAssetsInScope(data.scopeType, scopeValue);

    if (assets.length > 0) {
      await auditRepository.bulkCreateRecords(
        assets.map((a) => ({ auditCycleId: cycle.id, assetId: a.id }))
      );

      // Bulk asset history: AUDIT_STARTED per asset
      await db.insert(assetHistory).values(
        assets.map((a) => ({
          id: generateId(),
          assetId: a.id,
          action: "AUDIT_STARTED",
          performedBy: createdBy,
          timestamp: new Date(),
          metadata: { auditCycleId: cycle.id, auditName: data.name },
        }))
      );
    }

    return { ...cycle, assetCount: assets.length };
  },

  async update(id: string, data: UpdateAuditCycleInput) {
    const cycle = await auditRepository.findCycleRawById(id);
    if (!cycle) throw new NotFoundError("Audit cycle not found");

    if (cycle.status === "COMPLETED" || cycle.status === "CANCELLED")
      throw new ValidationError(
        `Cannot update an audit with status "${cycle.status}"`
      );

    // Validate status transition
    if (data.status) {
      if (data.status === "ACTIVE" && cycle.status !== "PLANNED")
        throw new ValidationError("Can only activate a PLANNED audit");
      if (data.status === "CANCELLED" && !["PLANNED", "ACTIVE"].includes(cycle.status))
        throw new ValidationError("Can only cancel a PLANNED or ACTIVE audit");
    }

    // Once ACTIVE, scope/dates should not change
    if (cycle.status === "ACTIVE" && (data.startDate || data.endDate)) {
      throw new ValidationError("Cannot change dates on an ACTIVE audit");
    }

    const values: Partial<typeof cycle> = {};
    if (data.name !== undefined) values.name = data.name;
    if (data.description !== undefined) values.description = data.description;
    if (data.startDate !== undefined) values.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) values.endDate = new Date(data.endDate);
    if (data.status !== undefined) values.status = data.status as AuditStatus;

    return auditRepository.updateCycle(id, values);
  },

  async assignAuditors(id: string, data: AssignAuditorsInput) {
    const cycle = await auditRepository.findCycleRawById(id);
    if (!cycle) throw new NotFoundError("Audit cycle not found");

    if (cycle.status === "COMPLETED" || cycle.status === "CANCELLED")
      throw new ValidationError(
        `Cannot assign auditors to an audit with status "${cycle.status}"`
      );

    // Validate each auditor exists and is active
    const uniqueIds = [...new Set(data.auditorIds)];
    for (const auditorId of uniqueIds) {
      const rows = await db
        .select({ id: user.id, status: user.status })
        .from(user)
        .where(eq(user.id, auditorId))
        .limit(1);
      if (!rows[0]) throw new NotFoundError(`Auditor "${auditorId}" not found`);
      if (rows[0].status === "INACTIVE")
        throw new ValidationError(`Auditor "${auditorId}" account is inactive`);
    }

    return auditRepository.setAuditors(id, uniqueIds);
  },

  async verifyAsset(
    auditCycleId: string,
    assetId: string,
    data: VerifyAssetInput,
    verifiedBy: string
  ) {
    const cycle = await auditRepository.findCycleRawById(auditCycleId);
    if (!cycle) throw new NotFoundError("Audit cycle not found");

    if (cycle.status !== "ACTIVE")
      throw new ValidationError(
        `Asset verification requires an ACTIVE audit (current status: "${cycle.status}")`
      );

    const isAssigned = await auditRepository.isAuditorAssigned(auditCycleId, verifiedBy);
    if (!isAssigned)
      throw new ForbiddenError("You are not assigned as an auditor for this audit cycle");

    const foundAsset = await assetRepository.findById(assetId);
    if (!foundAsset) throw new NotFoundError("Asset not found");

    const record = await auditRepository.findRecordByAuditAndAsset(auditCycleId, assetId);
    if (!record)
      throw new NotFoundError("This asset is not part of the audit cycle's scope");

    if (record.verificationStatus !== null)
      throw new ConflictError(
        `Asset has already been verified as "${record.verificationStatus}" in this audit`
      );

    const verified = await auditRepository.verifyRecord(record.id, {
      verifiedBy,
      verificationStatus: data.verificationStatus,
      remarks: data.remarks,
    });

    const historyAction =
      data.verificationStatus === "VERIFIED"
        ? "ASSET_VERIFIED"
        : data.verificationStatus === "MISSING"
          ? "ASSET_MARKED_MISSING"
          : "ASSET_MARKED_DAMAGED";

    await assetRepository.createHistory({
      assetId,
      action: historyAction,
      performedBy: verifiedBy,
      metadata: {
        auditCycleId,
        auditName: cycle.name,
        verificationStatus: data.verificationStatus,
        remarks: data.remarks ?? null,
      },
    });

    return verified;
  },

  async getById(id: string, requesterId: string, requesterRole: Role) {
    const found = await auditRepository.findCycleById(id);
    if (!found) throw new NotFoundError("Audit cycle not found");

    await this._assertCanView(found.cycle, requesterId, requesterRole);

    const [assignments, stats] = await Promise.all([
      auditRepository.findAssignments(id),
      auditRepository.findRecordStats(id),
    ]);

    return { ...found, auditors: assignments, stats };
  },

  async getAll(query: AuditQueryInput, requesterId: string, requesterRole: Role) {
    const scopedQuery = await this._scopeQuery(query, requesterId, requesterRole);
    const { rows, total } = await auditRepository.findAllCycles(scopedQuery);
    const totalPages = Math.ceil(total / query.limit);
    return {
      data: rows,
      meta: { total, page: query.page, limit: query.limit, totalPages },
    };
  },

  async getDiscrepancyReport(id: string, requesterId: string, requesterRole: Role) {
    const cycle = await auditRepository.findCycleById(id);
    if (!cycle) throw new NotFoundError("Audit cycle not found");

    await this._assertCanView(cycle.cycle, requesterId, requesterRole);

    const [discrepancies, stats] = await Promise.all([
      auditRepository.findDiscrepancies(id),
      auditRepository.findRecordStats(id),
    ]);

    const missing = discrepancies.filter((d) => d.record.verificationStatus === "MISSING");
    const damaged = discrepancies.filter((d) => d.record.verificationStatus === "DAMAGED");

    return {
      auditCycle: cycle,
      stats,
      missing,
      damaged,
      generatedAt: new Date().toISOString(),
    };
  },

  async close(id: string, closedBy: string) {
    const cycle = await auditRepository.findCycleRawById(id);
    if (!cycle) throw new NotFoundError("Audit cycle not found");

    if (cycle.status !== "ACTIVE")
      throw new ValidationError(
        `Can only close an ACTIVE audit (current status: "${cycle.status}")`
      );

    // Process MISSING assets → status LOST
    const missingRecords = await auditRepository.findRecordsByVerificationStatus(id, "MISSING");
    if (missingRecords.length > 0) {
      await Promise.all(
        missingRecords.map(async (r) => {
          await assetRepository.update(r.assetId, { status: "LOST" });
          await assetRepository.createHistory({
            assetId: r.assetId,
            action: "AUDIT_MARKED_LOST",
            performedBy: closedBy,
            metadata: { auditCycleId: id, auditName: cycle.name },
          });
        })
      );
    }

    // Process DAMAGED assets → flag for review (no status change)
    const damagedRecords = await auditRepository.findRecordsByVerificationStatus(id, "DAMAGED");
    if (damagedRecords.length > 0) {
      await Promise.all(
        damagedRecords.map((r) =>
          assetRepository.createHistory({
            assetId: r.assetId,
            action: "AUDIT_FLAGGED_FOR_REVIEW",
            performedBy: closedBy,
            metadata: { auditCycleId: id, auditName: cycle.name },
          })
        )
      );
    }

    const closed = await auditRepository.closeCycle(id, closedBy);

    return closed;
  },

  // ── Internal helpers ───────────────────────────────────────────────────────

  async _assertCanView(cycle: { scopeType: string; departmentId: string | null }, requesterId: string, requesterRole: Role) {
    if (requesterRole === "ADMIN" || requesterRole === "ASSET_MANAGER") return;

    if (requesterRole === "DEPARTMENT_HEAD") {
      const deptRows = await db
        .select({ id: department.id })
        .from(department)
        .where(eq(department.departmentHeadId, requesterId))
        .limit(1);
      const deptId = deptRows[0]?.id;
      if (deptId && cycle.scopeType === "DEPARTMENT" && cycle.departmentId === deptId) return;
      throw new ForbiddenError("This audit cycle is not in scope for your department");
    }

    throw new ForbiddenError("Access denied");
  },

  async _scopeQuery(query: AuditQueryInput, requesterId: string, requesterRole: Role): Promise<AuditQueryInput> {
    if (requesterRole === "ADMIN" || requesterRole === "ASSET_MANAGER") return query;

    if (requesterRole === "DEPARTMENT_HEAD") {
      const deptRows = await db
        .select({ id: department.id })
        .from(department)
        .where(eq(department.departmentHeadId, requesterId))
        .limit(1);
      const deptId = deptRows[0]?.id ?? "__NO_DEPT__";
      return { ...query, departmentId: deptId };
    }

    // EMPLOYEE should never reach here (blocked at route level)
    throw new ForbiddenError("Access denied");
  },
};
