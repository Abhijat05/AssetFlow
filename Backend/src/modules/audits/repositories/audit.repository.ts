import { eq, and, ilike, gte, lte, inArray, asc, desc, count, isNull, sql, SQL } from "drizzle-orm";
import { aliasedTable } from "drizzle-orm";
import { db } from "../../../db/index.js";
import {
  auditCycle,
  auditAssignment,
  auditRecord,
  asset,
  user,
  department,
} from "../../../db/schema/index.js";
import type { AuditQueryInput } from "../validators/audit.validator.js";
import type { VerificationStatus } from "../types/index.js";

const generateId = () => crypto.randomUUID();

export const auditRepository = {
  // ── Audit Cycles ───────────────────────────────────────────────────────────

  async createCycle(data: {
    name: string;
    description?: string | null;
    scopeType: "ORGANIZATION" | "DEPARTMENT" | "LOCATION";
    departmentId?: string | null;
    location?: string | null;
    startDate: Date;
    endDate: Date;
    createdBy: string;
  }) {
    const now = new Date();
    const [created] = await db
      .insert(auditCycle)
      .values({
        id: generateId(),
        name: data.name,
        description: data.description ?? null,
        scopeType: data.scopeType,
        departmentId: data.departmentId ?? null,
        location: data.location ?? null,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "PLANNED",
        createdBy: data.createdBy,
        closedBy: null,
        closedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  },

  async findCycleRawById(id: string) {
    const rows = await db
      .select()
      .from(auditCycle)
      .where(eq(auditCycle.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async findCycleById(id: string) {
    const creator = aliasedTable(user, "audit_creator");
    const closer = aliasedTable(user, "audit_closer");

    const rows = await db
      .select({
        cycle: auditCycle,
        creatorName: creator.name,
        closerName: closer.name,
        departmentName: department.name,
      })
      .from(auditCycle)
      .leftJoin(creator, eq(auditCycle.createdBy, creator.id))
      .leftJoin(closer, eq(auditCycle.closedBy, closer.id))
      .leftJoin(department, eq(auditCycle.departmentId, department.id))
      .where(eq(auditCycle.id, id))
      .limit(1);

    return rows[0] ?? null;
  },

  async findAllCycles(query: AuditQueryInput) {
    const {
      name,
      departmentId,
      location,
      status,
      auditorId,
      startDateFrom,
      startDateTo,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    const creator = aliasedTable(user, "audit_creator");

    // Pre-fetch audit cycle IDs that have this auditor (avoids a JOIN that would cause duplicates)
    let auditorFilterIds: string[] | null = null;
    if (auditorId) {
      const rows = await db
        .select({ id: auditAssignment.auditCycleId })
        .from(auditAssignment)
        .where(eq(auditAssignment.auditorId, auditorId));
      auditorFilterIds = rows.map((r) => r.id);
      if (auditorFilterIds.length === 0) return { rows: [], total: 0 };
    }

    const conditions: SQL[] = [];
    if (name) conditions.push(ilike(auditCycle.name, `%${name}%`));
    if (departmentId) conditions.push(eq(auditCycle.departmentId, departmentId));
    if (location) conditions.push(ilike(auditCycle.location, `%${location}%`));
    if (status) conditions.push(eq(auditCycle.status, status));
    if (startDateFrom) conditions.push(gte(auditCycle.startDate, new Date(startDateFrom)));
    if (startDateTo) conditions.push(lte(auditCycle.startDate, new Date(startDateTo)));
    if (auditorFilterIds) conditions.push(inArray(auditCycle.id, auditorFilterIds));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumn = {
      name: auditCycle.name,
      status: auditCycle.status,
      startDate: auditCycle.startDate,
      endDate: auditCycle.endDate,
      createdAt: auditCycle.createdAt,
    }[sortBy];

    const orderBy = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);
    const offset = (page - 1) * limit;

    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select({
          cycle: auditCycle,
          creatorName: creator.name,
          departmentName: department.name,
        })
        .from(auditCycle)
        .leftJoin(creator, eq(auditCycle.createdBy, creator.id))
        .leftJoin(department, eq(auditCycle.departmentId, department.id))
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(auditCycle).where(where),
    ]);

    return { rows, total: Number(total) };
  },

  async updateCycle(id: string, values: Partial<typeof auditCycle.$inferInsert>) {
    const [updated] = await db
      .update(auditCycle)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(auditCycle.id, id))
      .returning();
    return updated;
  },

  async closeCycle(id: string, closedBy: string) {
    const [updated] = await db
      .update(auditCycle)
      .set({
        status: "COMPLETED",
        closedBy,
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(auditCycle.id, id))
      .returning();
    return updated;
  },

  // ── Audit Assignments ──────────────────────────────────────────────────────

  async setAuditors(auditCycleId: string, auditorIds: string[]) {
    await db.delete(auditAssignment).where(eq(auditAssignment.auditCycleId, auditCycleId));

    if (auditorIds.length === 0) return [];

    const now = new Date();
    const inserted = await db
      .insert(auditAssignment)
      .values(
        auditorIds.map((auditorId) => ({
          id: generateId(),
          auditCycleId,
          auditorId,
          assignedAt: now,
        }))
      )
      .returning();
    return inserted;
  },

  async findAssignments(auditCycleId: string) {
    const auditor = aliasedTable(user, "audit_auditor");
    return db
      .select({
        assignment: auditAssignment,
        auditorName: auditor.name,
        auditorEmail: auditor.email,
        auditorRole: auditor.role,
      })
      .from(auditAssignment)
      .leftJoin(auditor, eq(auditAssignment.auditorId, auditor.id))
      .where(eq(auditAssignment.auditCycleId, auditCycleId))
      .orderBy(asc(auditAssignment.assignedAt));
  },

  async isAuditorAssigned(auditCycleId: string, userId: string) {
    const rows = await db
      .select({ id: auditAssignment.id })
      .from(auditAssignment)
      .where(
        and(
          eq(auditAssignment.auditCycleId, auditCycleId),
          eq(auditAssignment.auditorId, userId)
        )
      )
      .limit(1);
    return rows.length > 0;
  },

  // ── Audit Records ──────────────────────────────────────────────────────────

  async bulkCreateRecords(records: { auditCycleId: string; assetId: string }[]) {
    if (records.length === 0) return [];
    return db
      .insert(auditRecord)
      .values(
        records.map((r) => ({
          id: generateId(),
          auditCycleId: r.auditCycleId,
          assetId: r.assetId,
          verifiedBy: null,
          verificationStatus: null,
          remarks: null,
          verifiedAt: null,
        }))
      )
      .returning();
  },

  async findRecordByAuditAndAsset(auditCycleId: string, assetId: string) {
    const rows = await db
      .select()
      .from(auditRecord)
      .where(
        and(eq(auditRecord.auditCycleId, auditCycleId), eq(auditRecord.assetId, assetId))
      )
      .limit(1);
    return rows[0] ?? null;
  },

  async verifyRecord(
    id: string,
    data: { verifiedBy: string; verificationStatus: VerificationStatus; remarks?: string | null }
  ) {
    const [updated] = await db
      .update(auditRecord)
      .set({
        verifiedBy: data.verifiedBy,
        verificationStatus: data.verificationStatus,
        remarks: data.remarks ?? null,
        verifiedAt: new Date(),
      })
      .where(eq(auditRecord.id, id))
      .returning();
    return updated;
  },

  async findRecordStats(auditCycleId: string) {
    const rows = await db
      .select({
        status: auditRecord.verificationStatus,
        total: count(),
      })
      .from(auditRecord)
      .where(eq(auditRecord.auditCycleId, auditCycleId))
      .groupBy(auditRecord.verificationStatus);

    const result = { total: 0, verified: 0, missing: 0, damaged: 0, unverified: 0 };
    for (const row of rows) {
      const c = Number(row.total);
      result.total += c;
      if (row.status === "VERIFIED") result.verified = c;
      else if (row.status === "MISSING") result.missing = c;
      else if (row.status === "DAMAGED") result.damaged = c;
      else result.unverified = c;
    }
    return result;
  },

  async findDiscrepancies(auditCycleId: string) {
    const verifier = aliasedTable(user, "audit_verifier");
    return db
      .select({
        record: auditRecord,
        assetTag: asset.assetTag,
        assetName: asset.name,
        assetStatus: asset.status,
        assetLocation: asset.currentLocation,
        verifierName: verifier.name,
      })
      .from(auditRecord)
      .leftJoin(asset, eq(auditRecord.assetId, asset.id))
      .leftJoin(verifier, eq(auditRecord.verifiedBy, verifier.id))
      .where(
        and(
          eq(auditRecord.auditCycleId, auditCycleId),
          sql`${auditRecord.verificationStatus} IN ('MISSING'::verification_status, 'DAMAGED'::verification_status)`
        )
      )
      .orderBy(asc(auditRecord.verificationStatus));
  },

  async findRecordsByVerificationStatus(auditCycleId: string, status: VerificationStatus) {
    return db
      .select()
      .from(auditRecord)
      .where(
        and(
          eq(auditRecord.auditCycleId, auditCycleId),
          sql`${auditRecord.verificationStatus} = ${status}::verification_status`
        )
      );
  },

  async findUnverifiedRecords(auditCycleId: string) {
    return db
      .select()
      .from(auditRecord)
      .where(
        and(
          eq(auditRecord.auditCycleId, auditCycleId),
          isNull(auditRecord.verificationStatus)
        )
      );
  },

  // Fetch assets in scope for auto-populating audit records
  async findAssetsInScope(scopeType: "ORGANIZATION" | "DEPARTMENT" | "LOCATION", scopeValue?: string | null) {
    const conditions: SQL[] = [];

    if (scopeType === "DEPARTMENT" && scopeValue) {
      conditions.push(eq(asset.departmentId, scopeValue));
    } else if (scopeType === "LOCATION" && scopeValue) {
      conditions.push(eq(asset.currentLocation, scopeValue));
    }
    // ORGANIZATION: no additional filter

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    return db
      .select({ id: asset.id, assetTag: asset.assetTag })
      .from(asset)
      .where(where);
  },
};
