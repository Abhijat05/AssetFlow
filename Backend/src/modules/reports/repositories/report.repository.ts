import {
  eq,
  and,
  ne,
  gte,
  lte,
  inArray,
  isNotNull,
  count,
  desc,
  asc,
  sql,
  SQL,
} from "drizzle-orm";
import { aliasedTable } from "drizzle-orm";
import { db } from "../../../db/index.js";
import {
  asset,
  assetCategory,
  assetAllocation,
  booking,
  maintenanceRequest,
  auditCycle,
  auditRecord,
  department,
  user,
} from "../../../db/schema/index.js";
import type { ReportFilterInput } from "../validators/report.validator.js";

// ── Shared helpers ─────────────────────────────────────────────────────────────

function assetConditions(f: ReportFilterInput): SQL[] {
  const c: SQL[] = [];
  if (f.departmentId) c.push(eq(asset.departmentId, f.departmentId));
  if (f.categoryId) c.push(eq(asset.categoryId, f.categoryId));
  if (f.assetId) c.push(eq(asset.id, f.assetId));
  if (f.location) c.push(eq(asset.currentLocation, f.location));
  if (f.dateFrom) c.push(gte(asset.createdAt, new Date(f.dateFrom)));
  if (f.dateTo) c.push(lte(asset.createdAt, new Date(f.dateTo)));
  return c;
}

function maintConditions(f: ReportFilterInput): SQL[] {
  const c: SQL[] = [];
  if (f.assetId) c.push(eq(maintenanceRequest.assetId, f.assetId));
  if (f.employeeId) c.push(eq(maintenanceRequest.reportedBy, f.employeeId));
  if (f.dateFrom) c.push(gte(maintenanceRequest.createdAt, new Date(f.dateFrom)));
  if (f.dateTo) c.push(lte(maintenanceRequest.createdAt, new Date(f.dateTo)));
  // dept / category / location need asset join — handled per-method via asset join
  return c;
}

function bookingConditions(f: ReportFilterInput): SQL[] {
  const c: SQL[] = [];
  if (f.departmentId) c.push(eq(booking.departmentId, f.departmentId));
  if (f.assetId) c.push(eq(booking.assetId, f.assetId));
  if (f.employeeId) c.push(eq(booking.bookedBy, f.employeeId));
  if (f.dateFrom) c.push(gte(booking.startTime, new Date(f.dateFrom)));
  if (f.dateTo) c.push(lte(booking.startTime, new Date(f.dateTo)));
  return c;
}

function auditConditions(f: ReportFilterInput): SQL[] {
  const c: SQL[] = [];
  if (f.departmentId) c.push(eq(auditCycle.departmentId, f.departmentId));
  if (f.dateFrom) c.push(gte(auditCycle.createdAt, new Date(f.dateFrom)));
  if (f.dateTo) c.push(lte(auditCycle.createdAt, new Date(f.dateTo)));
  return c;
}

// ── Utilization ────────────────────────────────────────────────────────────────

export const reportRepository = {
  async utilization(f: ReportFilterInput) {
    const ac = assetConditions(f);
    const assetWhere = ac.length ? and(...ac) : undefined;

    const [statusRows, mostUsed, leastUsed] = await Promise.all([
      db
        .select({ status: asset.status, total: count() })
        .from(asset)
        .where(assetWhere)
        .groupBy(asset.status),

      db
        .select({
          assetId: asset.id,
          assetTag: asset.assetTag,
          assetName: asset.name,
          allocationCount: sql<number>`COUNT(${assetAllocation.id})`,
        })
        .from(asset)
        .leftJoin(assetAllocation, eq(assetAllocation.assetId, asset.id))
        .where(assetWhere)
        .groupBy(asset.id, asset.assetTag, asset.name)
        .orderBy(sql`COUNT(${assetAllocation.id}) DESC`)
        .limit(10),

      db
        .select({
          assetId: asset.id,
          assetTag: asset.assetTag,
          assetName: asset.name,
          allocationCount: sql<number>`COUNT(${assetAllocation.id})`,
        })
        .from(asset)
        .leftJoin(assetAllocation, eq(assetAllocation.assetId, asset.id))
        .where(assetWhere)
        .groupBy(asset.id, asset.assetTag, asset.name)
        .orderBy(sql`COUNT(${assetAllocation.id}) ASC`)
        .limit(10),
    ]);

    return { statusRows, mostUsed, leastUsed };
  },

  // ── Maintenance ────────────────────────────────────────────────────────────

  async maintenance(f: ReportFilterInput) {
    const mc = maintConditions(f);
    const assetJoinConditions: SQL[] = [];
    if (f.departmentId) assetJoinConditions.push(eq(asset.departmentId, f.departmentId));
    if (f.categoryId) assetJoinConditions.push(eq(asset.categoryId, f.categoryId));
    if (f.location) assetJoinConditions.push(eq(asset.currentLocation, f.location));

    const allConditions = [...mc, ...assetJoinConditions];
    const where = allConditions.length ? and(...allConditions) : undefined;

    const offset = (f.page - 1) * f.limit;

    const [statusRows, byAsset, byCategory, byDept] = await Promise.all([
      db
        .select({ status: maintenanceRequest.status, total: count() })
        .from(maintenanceRequest)
        .leftJoin(asset, eq(maintenanceRequest.assetId, asset.id))
        .where(where)
        .groupBy(maintenanceRequest.status),

      db
        .select({
          assetId: asset.id,
          assetTag: asset.assetTag,
          assetName: asset.name,
          count: count(),
        })
        .from(maintenanceRequest)
        .leftJoin(asset, eq(maintenanceRequest.assetId, asset.id))
        .where(where)
        .groupBy(asset.id, asset.assetTag, asset.name)
        .orderBy(desc(count()))
        .limit(f.limit)
        .offset(offset),

      db
        .select({
          categoryId: assetCategory.id,
          categoryName: assetCategory.name,
          count: count(),
        })
        .from(maintenanceRequest)
        .leftJoin(asset, eq(maintenanceRequest.assetId, asset.id))
        .leftJoin(assetCategory, eq(asset.categoryId, assetCategory.id))
        .where(where)
        .groupBy(assetCategory.id, assetCategory.name)
        .orderBy(desc(count())),

      db
        .select({
          departmentId: department.id,
          departmentName: department.name,
          count: count(),
        })
        .from(maintenanceRequest)
        .leftJoin(asset, eq(maintenanceRequest.assetId, asset.id))
        .leftJoin(department, eq(asset.departmentId, department.id))
        .where(where)
        .groupBy(department.id, department.name)
        .orderBy(desc(count())),
    ]);

    return { statusRows, byAsset, byCategory, byDept };
  },

  async maintenanceDue(f: ReportFilterInput) {
    const assetJoinConditions: SQL[] = [];
    if (f.departmentId) assetJoinConditions.push(eq(asset.departmentId, f.departmentId));
    if (f.categoryId) assetJoinConditions.push(eq(asset.categoryId, f.categoryId));

    const buildWhere = (statusCondition: SQL): SQL => {
      const conds = [statusCondition, ...assetJoinConditions];
      if (f.assetId) conds.push(eq(maintenanceRequest.assetId, f.assetId));
      return and(...conds) as SQL;
    };

    const baseSelect = {
      requestId: maintenanceRequest.id,
      assetId: maintenanceRequest.assetId,
      assetTag: asset.assetTag,
      assetName: asset.name,
      issueTitle: maintenanceRequest.issueTitle,
    };

    const [upcoming, overdue, recentlyServiced] = await Promise.all([
      db
        .select({ ...baseSelect, priority: maintenanceRequest.priority, status: maintenanceRequest.status })
        .from(maintenanceRequest)
        .leftJoin(asset, eq(maintenanceRequest.assetId, asset.id))
        .where(buildWhere(inArray(maintenanceRequest.status, ["PENDING", "APPROVED", "TECHNICIAN_ASSIGNED"])))
        .orderBy(asc(maintenanceRequest.createdAt))
        .limit(50),

      db
        .select({
          ...baseSelect,
          daysInProgress: sql<number>`FLOOR(EXTRACT(EPOCH FROM (NOW() - ${maintenanceRequest.createdAt})) / 86400)::int`,
        })
        .from(maintenanceRequest)
        .leftJoin(asset, eq(maintenanceRequest.assetId, asset.id))
        .where(buildWhere(and(
          eq(maintenanceRequest.status, "IN_PROGRESS"),
          sql`${maintenanceRequest.createdAt} < NOW() - INTERVAL '14 days'`
        ) as SQL))
        .orderBy(asc(maintenanceRequest.createdAt))
        .limit(50),

      db
        .select({ ...baseSelect, resolvedAt: maintenanceRequest.resolvedAt })
        .from(maintenanceRequest)
        .leftJoin(asset, eq(maintenanceRequest.assetId, asset.id))
        .where(buildWhere(and(
          eq(maintenanceRequest.status, "RESOLVED"),
          sql`${maintenanceRequest.resolvedAt} > NOW() - INTERVAL '30 days'`
        ) as SQL))
        .orderBy(desc(maintenanceRequest.resolvedAt))
        .limit(50),
    ]);

    return { upcoming, overdue, recentlyServiced };
  },

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async lifecycle(f: ReportFilterInput) {
    const ac = assetConditions(f);
    const where = ac.length ? and(...ac) : undefined;

    const [statusRows, [{ total }]] = await Promise.all([
      db
        .select({ status: asset.status, count: count() })
        .from(asset)
        .where(where)
        .groupBy(asset.status)
        .orderBy(desc(count())),
      db.select({ total: count() }).from(asset).where(where),
    ]);

    return { statusRows, total: Number(total) };
  },

  // ── Department Summary ─────────────────────────────────────────────────────

  async departments(f: ReportFilterInput) {
    const deptWhere = f.departmentId ? eq(department.id, f.departmentId) : undefined;

    const [assetRows, empRows] = await Promise.all([
      db
        .select({
          departmentId: department.id,
          departmentName: department.name,
          totalAssets: sql<number>`COUNT(DISTINCT ${asset.id}) FILTER (WHERE ${asset.id} IS NOT NULL)`,
          allocatedAssets: sql<number>`COUNT(DISTINCT ${asset.id}) FILTER (WHERE ${asset.status} = 'ALLOCATED')`,
          availableAssets: sql<number>`COUNT(DISTINCT ${asset.id}) FILTER (WHERE ${asset.status} = 'AVAILABLE')`,
          bookableAssets: sql<number>`COUNT(DISTINCT ${asset.id}) FILTER (WHERE ${asset.isBookable} = true)`,
        })
        .from(department)
        .leftJoin(asset, eq(asset.departmentId, department.id))
        .where(deptWhere)
        .groupBy(department.id, department.name)
        .orderBy(asc(department.name)),

      db
        .select({
          departmentId: user.departmentId,
          employeeCount: count(),
        })
        .from(user)
        .where(and(eq(user.status, "ACTIVE"), isNotNull(user.departmentId), deptWhere ? eq(user.departmentId, f.departmentId!) : undefined))
        .groupBy(user.departmentId),
    ]);

    return { assetRows, empRows };
  },

  // ── Booking Analytics ──────────────────────────────────────────────────────

  async bookings(f: ReportFilterInput) {
    const bc = bookingConditions(f);
    const where = bc.length ? and(...bc) : undefined;
    const nonCancelledWhere = bc.length
      ? and(...bc, ne(booking.status, "CANCELLED"))
      : ne(booking.status, "CANCELLED");

    const assetForBooking = aliasedTable(asset, "booking_asset");
    const assetBookWhere = (() => {
      const conds: SQL[] = [];
      if (f.categoryId) conds.push(eq(assetForBooking.categoryId, f.categoryId));
      if (f.location) conds.push(eq(assetForBooking.currentLocation, f.location));
      return conds.length ? and(...conds) : undefined;
    })();

    const [statusRows, perDay, peakHours, mostBooked] = await Promise.all([
      db
        .select({ status: booking.status, total: count() })
        .from(booking)
        .where(where)
        .groupBy(booking.status),

      db
        .select({
          date: sql<string>`DATE(${booking.startTime})::text`,
          count: count(),
        })
        .from(booking)
        .where(where)
        .groupBy(sql`DATE(${booking.startTime})`)
        .orderBy(sql`DATE(${booking.startTime}) ASC`),

      db
        .select({
          hour: sql<number>`EXTRACT(HOUR FROM ${booking.startTime})::int`,
          count: count(),
        })
        .from(booking)
        .where(where)
        .groupBy(sql`EXTRACT(HOUR FROM ${booking.startTime})`)
        .orderBy(desc(count())),

      db
        .select({
          assetId: assetForBooking.id,
          assetTag: assetForBooking.assetTag,
          assetName: assetForBooking.name,
          count: count(),
        })
        .from(booking)
        .leftJoin(assetForBooking, eq(booking.assetId, assetForBooking.id))
        .where(and(nonCancelledWhere, assetBookWhere))
        .groupBy(assetForBooking.id, assetForBooking.assetTag, assetForBooking.name)
        .orderBy(desc(count()))
        .limit(10),
    ]);

    // Least booked: bookable assets with fewest bookings
    const [bookableAssets, bookingsByAsset] = await Promise.all([
      db
        .select({ id: asset.id, assetTag: asset.assetTag, assetName: asset.name })
        .from(asset)
        .where(and(eq(asset.isBookable, true), assetBookWhere ? assetBookWhere : undefined)),

      db
        .select({ assetId: booking.assetId, cnt: count() })
        .from(booking)
        .where(nonCancelledWhere)
        .groupBy(booking.assetId),
    ]);

    const countMap = new Map(bookingsByAsset.map((b) => [b.assetId, Number(b.cnt)]));
    const leastBooked = bookableAssets
      .map((a) => ({ assetId: a.id, assetTag: a.assetTag, assetName: a.assetName, count: countMap.get(a.id) ?? 0 }))
      .sort((a, b) => a.count - b.count)
      .slice(0, 10);

    return { statusRows, perDay, peakHours, mostBooked, leastBooked };
  },

  // ── Audit Analytics ────────────────────────────────────────────────────────

  async audits(f: ReportFilterInput) {
    const ac = auditConditions(f);
    const cycleWhere = ac.length ? and(...ac) : undefined;
    const discrepancyCondition = sql`${auditRecord.verificationStatus} IN ('MISSING'::verification_status, 'DAMAGED'::verification_status)`;

    const [statusRows, [{ total: missing }], [{ total: damaged }], [{ total: resolved }], recentCycles] =
      await Promise.all([
        db
          .select({ status: auditCycle.status, total: count() })
          .from(auditCycle)
          .where(cycleWhere)
          .groupBy(auditCycle.status),

        db
          .select({ total: count() })
          .from(auditRecord)
          .leftJoin(auditCycle, eq(auditRecord.auditCycleId, auditCycle.id))
          .where(and(sql`${auditRecord.verificationStatus} = 'MISSING'::verification_status`, cycleWhere)),

        db
          .select({ total: count() })
          .from(auditRecord)
          .leftJoin(auditCycle, eq(auditRecord.auditCycleId, auditCycle.id))
          .where(and(sql`${auditRecord.verificationStatus} = 'DAMAGED'::verification_status`, cycleWhere)),

        // Resolved = discrepancies inside COMPLETED cycles
        db
          .select({ total: count() })
          .from(auditRecord)
          .leftJoin(auditCycle, eq(auditRecord.auditCycleId, auditCycle.id))
          .where(
            and(discrepancyCondition, eq(auditCycle.status, "COMPLETED"),
              f.departmentId ? eq(auditCycle.departmentId, f.departmentId) : undefined)
          ),

        db
          .select({
            id: auditCycle.id,
            name: auditCycle.name,
            status: auditCycle.status,
            scopeType: auditCycle.scopeType,
            startDate: auditCycle.startDate,
            endDate: auditCycle.endDate,
          })
          .from(auditCycle)
          .where(cycleWhere)
          .orderBy(desc(auditCycle.createdAt))
          .limit(10),
      ]);

    return {
      statusRows,
      missing: Number(missing),
      damaged: Number(damaged),
      resolved: Number(resolved),
      recentCycles,
    };
  },
};
