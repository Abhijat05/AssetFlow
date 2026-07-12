import { eq, and, inArray, count, desc, asc, sql } from "drizzle-orm";
import { aliasedTable } from "drizzle-orm";
import { db } from "../../../db/index.js";
import {
  asset,
  assetHistory,
  assetAllocation,
  transferRequest,
  booking,
  maintenanceRequest,
  auditCycle,
  auditRecord,
  department,
  user,
} from "../../../db/schema/index.js";
import type { Role } from "../../../types/index.js";
import type { KpiData, QuickActions } from "../types/index.js";

function emptyKpis(): KpiData {
  return {
    assetsAvailable: 0,
    assetsAllocated: 0,
    assetsUnderMaintenance: 0,
    assetsReserved: 0,
    assetsLost: 0,
    assetsRetired: 0,
    activeBookings: 0,
    todaysBookings: 0,
    pendingTransferRequests: 0,
    pendingMaintenanceRequests: 0,
    upcomingReturns: 0,
    overdueReturns: 0,
    activeAuditCycles: 0,
    completedAuditCycles: 0,
  };
}

export const dashboardService = {
  // ── Internal helpers ───────────────────────────────────────────────────────

  async _getDeptId(userId: string): Promise<string | null> {
    const rows = await db
      .select({ id: department.id })
      .from(department)
      .where(eq(department.departmentHeadId, userId))
      .limit(1);
    return rows[0]?.id ?? null;
  },

  // ── KPIs ───────────────────────────────────────────────────────────────────

  async getKpis(userId: string, role: Role): Promise<KpiData> {
    if (role === "EMPLOYEE") {
      return this._employeeKpis(userId);
    }

    const deptId =
      role === "DEPARTMENT_HEAD" ? await this._getDeptId(userId) : null;

    if (role === "DEPARTMENT_HEAD" && deptId === null) {
      return emptyKpis();
    }

    return this._orgKpis(deptId);
  },

  async _orgKpis(deptId: string | null): Promise<KpiData> {
    const d = deptId;

    const upcomingReturnsCondition = and(
      inArray(assetAllocation.status, ["ACTIVE", "RETURN_REQUESTED"]),
      sql`${assetAllocation.expectedReturnDate} IS NOT NULL AND ${assetAllocation.expectedReturnDate} BETWEEN NOW() AND NOW() + INTERVAL '7 days'`,
      d ? eq(assetAllocation.departmentId, d) : undefined
    );

    const [
      assetRows,
      [{ total: activeBookings }],
      [{ total: todaysBookings }],
      [{ total: pendingTransfers }],
      [{ total: pendingMaint }],
      [{ total: upcomingReturns }],
      [{ total: overdueReturns }],
      [{ total: activeAudits }],
      [{ total: completedAudits }],
    ] = await Promise.all([
      db
        .select({ status: asset.status, total: count() })
        .from(asset)
        .where(d ? eq(asset.departmentId, d) : undefined)
        .groupBy(asset.status),

      db
        .select({ total: count() })
        .from(booking)
        .where(and(eq(booking.status, "ONGOING"), d ? eq(booking.departmentId, d) : undefined)),

      db
        .select({ total: count() })
        .from(booking)
        .where(and(sql`${booking.startTime}::date = CURRENT_DATE`, d ? eq(booking.departmentId, d) : undefined)),

      d
        ? db
            .select({ total: count() })
            .from(transferRequest)
            .leftJoin(asset, eq(transferRequest.assetId, asset.id))
            .where(and(eq(transferRequest.status, "PENDING"), eq(asset.departmentId, d)))
        : db
            .select({ total: count() })
            .from(transferRequest)
            .where(eq(transferRequest.status, "PENDING")),

      d
        ? db
            .select({ total: count() })
            .from(maintenanceRequest)
            .leftJoin(asset, eq(maintenanceRequest.assetId, asset.id))
            .where(and(eq(maintenanceRequest.status, "PENDING"), eq(asset.departmentId, d)))
        : db
            .select({ total: count() })
            .from(maintenanceRequest)
            .where(eq(maintenanceRequest.status, "PENDING")),

      db.select({ total: count() }).from(assetAllocation).where(upcomingReturnsCondition),

      db
        .select({ total: count() })
        .from(assetAllocation)
        .where(and(eq(assetAllocation.status, "OVERDUE"), d ? eq(assetAllocation.departmentId, d) : undefined)),

      db
        .select({ total: count() })
        .from(auditCycle)
        .where(and(eq(auditCycle.status, "ACTIVE"), d ? eq(auditCycle.departmentId, d) : undefined)),

      db
        .select({ total: count() })
        .from(auditCycle)
        .where(and(eq(auditCycle.status, "COMPLETED"), d ? eq(auditCycle.departmentId, d) : undefined)),
    ]);

    const am: Record<string, number> = {};
    for (const r of assetRows) am[r.status] = Number(r.total);

    return {
      assetsAvailable: am["AVAILABLE"] ?? 0,
      assetsAllocated: am["ALLOCATED"] ?? 0,
      assetsUnderMaintenance: am["UNDER_MAINTENANCE"] ?? 0,
      assetsReserved: am["RESERVED"] ?? 0,
      assetsLost: am["LOST"] ?? 0,
      assetsRetired: am["RETIRED"] ?? 0,
      activeBookings: Number(activeBookings),
      todaysBookings: Number(todaysBookings),
      pendingTransferRequests: Number(pendingTransfers),
      pendingMaintenanceRequests: Number(pendingMaint),
      upcomingReturns: Number(upcomingReturns),
      overdueReturns: Number(overdueReturns),
      activeAuditCycles: Number(activeAudits),
      completedAuditCycles: Number(completedAudits),
    };
  },

  async _employeeKpis(userId: string): Promise<KpiData> {
    const [
      allocRows,
      [{ total: activeBookings }],
      [{ total: todaysBookings }],
      [{ total: pendingMaint }],
      [{ total: upcomingReturns }],
      [{ total: overdueReturns }],
    ] = await Promise.all([
      db
        .select({ status: assetAllocation.status, total: count() })
        .from(assetAllocation)
        .where(eq(assetAllocation.employeeId, userId))
        .groupBy(assetAllocation.status),

      db
        .select({ total: count() })
        .from(booking)
        .where(and(eq(booking.status, "ONGOING"), eq(booking.bookedBy, userId))),

      db
        .select({ total: count() })
        .from(booking)
        .where(and(sql`${booking.startTime}::date = CURRENT_DATE`, eq(booking.bookedBy, userId))),

      db
        .select({ total: count() })
        .from(maintenanceRequest)
        .where(and(eq(maintenanceRequest.status, "PENDING"), eq(maintenanceRequest.reportedBy, userId))),

      db
        .select({ total: count() })
        .from(assetAllocation)
        .where(
          and(
            inArray(assetAllocation.status, ["ACTIVE", "RETURN_REQUESTED"]),
            sql`${assetAllocation.expectedReturnDate} IS NOT NULL AND ${assetAllocation.expectedReturnDate} BETWEEN NOW() AND NOW() + INTERVAL '7 days'`,
            eq(assetAllocation.employeeId, userId)
          )
        ),

      db
        .select({ total: count() })
        .from(assetAllocation)
        .where(and(eq(assetAllocation.status, "OVERDUE"), eq(assetAllocation.employeeId, userId))),
    ]);

    const am: Record<string, number> = {};
    for (const r of allocRows) am[r.status] = Number(r.total);

    return {
      assetsAvailable: 0,
      assetsAllocated: am["ACTIVE"] ?? 0,
      assetsUnderMaintenance: 0,
      assetsReserved: 0,
      assetsLost: 0,
      assetsRetired: 0,
      activeBookings: Number(activeBookings),
      todaysBookings: Number(todaysBookings),
      pendingTransferRequests: 0,
      pendingMaintenanceRequests: Number(pendingMaint),
      upcomingReturns: Number(upcomingReturns),
      overdueReturns: Number(overdueReturns),
      activeAuditCycles: 0,
      completedAuditCycles: 0,
    };
  },

  // ── Quick Actions ──────────────────────────────────────────────────────────

  getQuickActions(role: Role): QuickActions {
    const isAdmin = role === "ADMIN";
    const isManager = role === "ADMIN" || role === "ASSET_MANAGER";
    return {
      registerAsset: isManager,
      allocateAsset: isManager,
      bookResource: true,
      raiseMaintenanceRequest: true,
      createAudit: isAdmin,
      createDepartment: isAdmin,
    };
  },

  // ── Recent Activity ────────────────────────────────────────────────────────

  async getActivity(userId: string, role: Role) {
    const performer = aliasedTable(user, "activity_performer");

    if (role === "DEPARTMENT_HEAD") {
      const deptId = await this._getDeptId(userId);
      if (!deptId) return [];

      return db
        .select({
          id: assetHistory.id,
          assetId: assetHistory.assetId,
          assetTag: asset.assetTag,
          assetName: asset.name,
          action: assetHistory.action,
          performedBy: assetHistory.performedBy,
          performedByName: performer.name,
          timestamp: assetHistory.timestamp,
          metadata: assetHistory.metadata,
        })
        .from(assetHistory)
        .innerJoin(asset, eq(assetHistory.assetId, asset.id))
        .leftJoin(performer, eq(assetHistory.performedBy, performer.id))
        .where(eq(asset.departmentId, deptId))
        .orderBy(desc(assetHistory.timestamp))
        .limit(20);
    }

    const where =
      role === "EMPLOYEE" ? eq(assetHistory.performedBy, userId) : undefined;

    return db
      .select({
        id: assetHistory.id,
        assetId: assetHistory.assetId,
        assetTag: asset.assetTag,
        assetName: asset.name,
        action: assetHistory.action,
        performedBy: assetHistory.performedBy,
        performedByName: performer.name,
        timestamp: assetHistory.timestamp,
        metadata: assetHistory.metadata,
      })
      .from(assetHistory)
      .leftJoin(asset, eq(assetHistory.assetId, asset.id))
      .leftJoin(performer, eq(assetHistory.performedBy, performer.id))
      .where(where)
      .orderBy(desc(assetHistory.timestamp))
      .limit(20);
  },

  // ── Returns ────────────────────────────────────────────────────────────────

  async getReturns(userId: string, role: Role) {
    const employee = aliasedTable(user, "return_employee");

    let scopeCondition: ReturnType<typeof eq> | undefined = undefined;

    if (role === "DEPARTMENT_HEAD") {
      const deptId = await this._getDeptId(userId);
      if (!deptId) return { overdue: [], upcoming: [] };
      scopeCondition = eq(assetAllocation.departmentId, deptId);
    } else if (role === "EMPLOYEE") {
      scopeCondition = eq(assetAllocation.employeeId, userId);
    }

    const returnSelect = {
      allocationId: assetAllocation.id,
      assetId: asset.id,
      assetTag: asset.assetTag,
      assetName: asset.name,
      employeeId: employee.id,
      employeeName: employee.name,
      departmentName: department.name,
      expectedReturnDate: assetAllocation.expectedReturnDate,
    };

    const [overdue, upcoming] = await Promise.all([
      db
        .select({
          ...returnSelect,
          daysOverdue: sql<number>`FLOOR(EXTRACT(EPOCH FROM (NOW() - ${assetAllocation.expectedReturnDate})) / 86400)::int`,
        })
        .from(assetAllocation)
        .leftJoin(asset, eq(assetAllocation.assetId, asset.id))
        .leftJoin(employee, eq(assetAllocation.employeeId, employee.id))
        .leftJoin(department, eq(assetAllocation.departmentId, department.id))
        .where(and(eq(assetAllocation.status, "OVERDUE"), scopeCondition))
        .orderBy(asc(assetAllocation.expectedReturnDate)),

      db
        .select(returnSelect)
        .from(assetAllocation)
        .leftJoin(asset, eq(assetAllocation.assetId, asset.id))
        .leftJoin(employee, eq(assetAllocation.employeeId, employee.id))
        .leftJoin(department, eq(assetAllocation.departmentId, department.id))
        .where(
          and(
            inArray(assetAllocation.status, ["ACTIVE", "RETURN_REQUESTED"]),
            sql`${assetAllocation.expectedReturnDate} IS NOT NULL AND ${assetAllocation.expectedReturnDate} BETWEEN NOW() AND NOW() + INTERVAL '7 days'`,
            scopeCondition
          )
        )
        .orderBy(asc(assetAllocation.expectedReturnDate)),
    ]);

    return { overdue, upcoming };
  },

  // ── Bookings ───────────────────────────────────────────────────────────────

  async getBookings(userId: string, role: Role) {
    const booker = aliasedTable(user, "booking_booker");

    let scopeCondition: ReturnType<typeof eq> | undefined = undefined;

    if (role === "DEPARTMENT_HEAD") {
      const deptId = await this._getDeptId(userId);
      if (!deptId) return { today: [], ongoing: [], upcoming: [] };
      scopeCondition = eq(booking.departmentId, deptId);
    } else if (role === "EMPLOYEE") {
      scopeCondition = eq(booking.bookedBy, userId);
    }

    const bookingSelect = {
      id: booking.id,
      title: booking.title,
      assetId: booking.assetId,
      assetName: asset.name,
      assetTag: asset.assetTag,
      bookedBy: booking.bookedBy,
      bookedByName: booker.name,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      purpose: booking.purpose,
    };

    const [today, ongoing, upcoming] = await Promise.all([
      db
        .select(bookingSelect)
        .from(booking)
        .leftJoin(asset, eq(booking.assetId, asset.id))
        .leftJoin(booker, eq(booking.bookedBy, booker.id))
        .where(and(sql`${booking.startTime}::date = CURRENT_DATE`, scopeCondition))
        .orderBy(asc(booking.startTime))
        .limit(20),

      db
        .select(bookingSelect)
        .from(booking)
        .leftJoin(asset, eq(booking.assetId, asset.id))
        .leftJoin(booker, eq(booking.bookedBy, booker.id))
        .where(and(eq(booking.status, "ONGOING"), scopeCondition))
        .orderBy(asc(booking.startTime))
        .limit(20),

      db
        .select(bookingSelect)
        .from(booking)
        .leftJoin(asset, eq(booking.assetId, asset.id))
        .leftJoin(booker, eq(booking.bookedBy, booker.id))
        .where(and(eq(booking.status, "UPCOMING"), scopeCondition))
        .orderBy(asc(booking.startTime))
        .limit(20),
    ]);

    return { today, ongoing, upcoming };
  },

  // ── Maintenance ────────────────────────────────────────────────────────────

  async getMaintenance(userId: string, role: Role) {
    let rows: { status: string; total: number | string }[];

    if (role === "DEPARTMENT_HEAD") {
      const deptId = await this._getDeptId(userId);
      if (!deptId) return { pending: 0, approved: 0, inProgress: 0, resolved: 0, rejected: 0 };

      rows = await db
        .select({ status: maintenanceRequest.status, total: count() })
        .from(maintenanceRequest)
        .leftJoin(asset, eq(maintenanceRequest.assetId, asset.id))
        .where(eq(asset.departmentId, deptId))
        .groupBy(maintenanceRequest.status);
    } else if (role === "EMPLOYEE") {
      rows = await db
        .select({ status: maintenanceRequest.status, total: count() })
        .from(maintenanceRequest)
        .where(eq(maintenanceRequest.reportedBy, userId))
        .groupBy(maintenanceRequest.status);
    } else {
      rows = await db
        .select({ status: maintenanceRequest.status, total: count() })
        .from(maintenanceRequest)
        .groupBy(maintenanceRequest.status);
    }

    const sm: Record<string, number> = {};
    for (const r of rows) sm[r.status] = Number(r.total);

    return {
      pending: sm["PENDING"] ?? 0,
      approved: (sm["APPROVED"] ?? 0) + (sm["TECHNICIAN_ASSIGNED"] ?? 0),
      inProgress: sm["IN_PROGRESS"] ?? 0,
      resolved: sm["RESOLVED"] ?? 0,
      rejected: sm["REJECTED"] ?? 0,
    };
  },

  // ── Audits ─────────────────────────────────────────────────────────────────

  async getAudits(userId: string, role: Role) {
    if (role === "EMPLOYEE") {
      return { planned: 0, active: 0, completed: 0, discrepancies: 0 };
    }

    const deptId =
      role === "DEPARTMENT_HEAD" ? await this._getDeptId(userId) : null;

    if (role === "DEPARTMENT_HEAD" && deptId === null) {
      return { planned: 0, active: 0, completed: 0, discrepancies: 0 };
    }

    const cycleWhere = deptId ? eq(auditCycle.departmentId, deptId) : undefined;

    const discrepancyCondition = sql`${auditRecord.verificationStatus} IN ('MISSING'::verification_status, 'DAMAGED'::verification_status)`;

    const [statusRows, [{ total: discrepancies }]] = await Promise.all([
      db
        .select({ status: auditCycle.status, total: count() })
        .from(auditCycle)
        .where(cycleWhere)
        .groupBy(auditCycle.status),

      deptId
        ? db
            .select({ total: count() })
            .from(auditRecord)
            .leftJoin(auditCycle, eq(auditRecord.auditCycleId, auditCycle.id))
            .where(and(discrepancyCondition, eq(auditCycle.departmentId, deptId)))
        : db
            .select({ total: count() })
            .from(auditRecord)
            .where(discrepancyCondition),
    ]);

    const sm: Record<string, number> = {};
    for (const r of statusRows) sm[r.status] = Number(r.total);

    return {
      planned: sm["PLANNED"] ?? 0,
      active: sm["ACTIVE"] ?? 0,
      completed: sm["COMPLETED"] ?? 0,
      discrepancies: Number(discrepancies),
    };
  },

  // ── Full Dashboard ─────────────────────────────────────────────────────────

  async getFull(userId: string, role: Role) {
    const [kpis, activity, returns, bookings, maintenance, audits] =
      await Promise.all([
        this.getKpis(userId, role),
        this.getActivity(userId, role),
        this.getReturns(userId, role),
        this.getBookings(userId, role),
        this.getMaintenance(userId, role),
        this.getAudits(userId, role),
      ]);

    return {
      kpis,
      quickActions: this.getQuickActions(role),
      activity,
      returns,
      bookings,
      maintenance,
      audits,
    };
  },
};
