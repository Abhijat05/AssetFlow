import { eq } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { department } from "../../../db/schema/index.js";
import { reportRepository } from "../repositories/report.repository.js";
import type { ReportFilterInput } from "../validators/report.validator.js";
import type {
  UtilizationReport,
  MaintenanceReport,
  LifecycleReport,
  DepartmentReport,
  BookingReport,
  AuditReport,
} from "../types/index.js";
import type { Role } from "../../../types/index.js";

async function getDeptId(userId: string): Promise<string | null> {
  const rows = await db
    .select({ id: department.id })
    .from(department)
    .where(eq(department.departmentHeadId, userId))
    .limit(1);
  return rows[0]?.id ?? null;
}

async function scopeFilter(
  filters: ReportFilterInput,
  userId: string,
  role: Role
): Promise<ReportFilterInput> {
  if (role === "ADMIN" || role === "ASSET_MANAGER") return filters;

  const deptId = await getDeptId(userId);
  // Force-inject their department; sentinel prevents leaking other depts
  return { ...filters, departmentId: deptId ?? "__NO_DEPT__" };
}

export const reportService = {
  async getUtilization(filters: ReportFilterInput, userId: string, role: Role): Promise<UtilizationReport> {
    const f = await scopeFilter(filters, userId, role);

    const { statusRows, mostUsed, leastUsed } = await reportRepository.utilization(f);

    const sm: Record<string, number> = {};
    let total = 0;
    for (const r of statusRows) {
      sm[r.status] = Number(r.total);
      total += Number(r.total);
    }

    const IDLE_STATUSES = new Set(["AVAILABLE"]);
    const UTILIZED_STATUSES = new Set(["ALLOCATED", "RESERVED", "UNDER_MAINTENANCE"]);
    const idle = IDLE_STATUSES.has("AVAILABLE") ? (sm["AVAILABLE"] ?? 0) : 0;
    const utilized = Array.from(UTILIZED_STATUSES).reduce((s, st) => s + (sm[st] ?? 0), 0);
    const utilizationPercentage = total > 0 ? Math.round((utilized / total) * 1000) / 10 : 0;

    return {
      summary: { total, utilized, idle, utilizationPercentage },
      mostUsed: mostUsed.map((r) => ({ ...r, allocationCount: Number(r.allocationCount) })),
      leastUsed: leastUsed.map((r) => ({ ...r, allocationCount: Number(r.allocationCount) })),
    };
  },

  async getMaintenance(filters: ReportFilterInput, userId: string, role: Role): Promise<MaintenanceReport> {
    const f = await scopeFilter(filters, userId, role);

    const [{ statusRows, byAsset, byCategory, byDept }, due] = await Promise.all([
      reportRepository.maintenance(f),
      reportRepository.maintenanceDue(f),
    ]);

    const sm: Record<string, number> = {};
    for (const r of statusRows) sm[r.status] = Number(r.total);
    const total = Object.values(sm).reduce((a, b) => a + b, 0);

    return {
      summary: {
        total,
        pending: sm["PENDING"] ?? 0,
        approved: (sm["APPROVED"] ?? 0) + (sm["TECHNICIAN_ASSIGNED"] ?? 0),
        inProgress: sm["IN_PROGRESS"] ?? 0,
        resolved: sm["RESOLVED"] ?? 0,
        rejected: sm["REJECTED"] ?? 0,
      },
      byAsset: byAsset.map((r) => ({ ...r, count: Number(r.count) })),
      byCategory: byCategory.map((r) => ({ ...r, count: Number(r.count) })),
      byDepartment: byDept.map((r) => ({ ...r, count: Number(r.count) })),
      dueForMaintenance: {
        upcoming: due.upcoming,
        overdue: due.overdue.map((r) => ({ ...r, daysInProgress: Number(r.daysInProgress) })),
        recentlyServiced: due.recentlyServiced,
      },
    };
  },

  async getLifecycle(filters: ReportFilterInput, userId: string, role: Role): Promise<LifecycleReport> {
    const f = await scopeFilter(filters, userId, role);

    const { statusRows, total } = await reportRepository.lifecycle(f);

    return {
      total,
      byStatus: statusRows.map((r) => ({
        status: r.status,
        count: Number(r.count),
        percentage: total > 0 ? Math.round((Number(r.count) / total) * 1000) / 10 : 0,
      })),
    };
  },

  async getDepartments(filters: ReportFilterInput, userId: string, role: Role): Promise<DepartmentReport> {
    const f = await scopeFilter(filters, userId, role);

    const { assetRows, empRows } = await reportRepository.departments(f);

    const empMap = new Map(empRows.map((e) => [e.departmentId, Number(e.employeeCount)]));

    return {
      departments: assetRows.map((r) => ({
        departmentId: r.departmentId,
        departmentName: r.departmentName,
        totalAssets: Number(r.totalAssets),
        allocatedAssets: Number(r.allocatedAssets),
        availableAssets: Number(r.availableAssets),
        bookableAssets: Number(r.bookableAssets),
        employeeCount: empMap.get(r.departmentId) ?? 0,
      })),
    };
  },

  async getBookings(filters: ReportFilterInput, userId: string, role: Role): Promise<BookingReport> {
    const f = await scopeFilter(filters, userId, role);

    const { statusRows, perDay, peakHours, mostBooked, leastBooked } =
      await reportRepository.bookings(f);

    const sm: Record<string, number> = {};
    for (const r of statusRows) sm[r.status] = Number(r.total);
    const total = Object.values(sm).reduce((a, b) => a + b, 0);
    const completed = sm["COMPLETED"] ?? 0;
    const cancelled = sm["CANCELLED"] ?? 0;

    const hourLabel = (h: number) =>
      `${String(h).padStart(2, "0")}:00–${String((h + 1) % 24).padStart(2, "0")}:00`;

    return {
      summary: {
        total,
        completed,
        cancelled,
        ongoing: sm["ONGOING"] ?? 0,
        upcoming: sm["UPCOMING"] ?? 0,
        completionRate: total > 0 ? Math.round((completed / total) * 1000) / 10 : 0,
        cancellationRate: total > 0 ? Math.round((cancelled / total) * 1000) / 10 : 0,
      },
      perDay: perDay.map((r) => ({ date: r.date, count: Number(r.count) })),
      peakHours: peakHours.map((r) => ({
        hour: Number(r.hour),
        label: hourLabel(Number(r.hour)),
        count: Number(r.count),
      })),
      mostBooked: mostBooked
        .filter((r): r is typeof r & { assetId: string } => r.assetId !== null)
        .map((r) => ({ ...r, count: Number(r.count) })),
      leastBooked,
    };
  },

  async getAudits(filters: ReportFilterInput, userId: string, role: Role): Promise<AuditReport> {
    const f = await scopeFilter(filters, userId, role);

    const { statusRows, missing, damaged, resolved, recentCycles } = await reportRepository.audits(f);

    const sm: Record<string, number> = {};
    for (const r of statusRows) sm[r.status] = Number(r.total);
    const total = Object.values(sm).reduce((a, b) => a + b, 0);
    const completedCount = sm["COMPLETED"] ?? 0;

    return {
      summary: {
        total,
        planned: sm["PLANNED"] ?? 0,
        active: sm["ACTIVE"] ?? 0,
        completed: completedCount,
        cancelled: sm["CANCELLED"] ?? 0,
        completionRate: total > 0 ? Math.round((completedCount / total) * 1000) / 10 : 0,
      },
      discrepancies: { missing, damaged, resolvedDiscrepancies: resolved },
      recentCycles,
    };
  },
};
