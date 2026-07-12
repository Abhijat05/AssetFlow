import type {
  ReportType,
  TableSection,
  UtilizationReport,
  MaintenanceReport,
  LifecycleReport,
  DepartmentReport,
  BookingReport,
  AuditReport,
} from "../types/index.js";

type AnyReport =
  | UtilizationReport
  | MaintenanceReport
  | LifecycleReport
  | DepartmentReport
  | BookingReport
  | AuditReport;

export function toSections(type: ReportType, data: AnyReport): TableSection[] {
  switch (type) {
    case "utilization":
      return utilizationSections(data as UtilizationReport);
    case "maintenance":
      return maintenanceSections(data as MaintenanceReport);
    case "lifecycle":
      return lifecycleSections(data as LifecycleReport);
    case "departments":
      return departmentSections(data as DepartmentReport);
    case "bookings":
      return bookingSections(data as BookingReport);
    case "audits":
      return auditSections(data as AuditReport);
  }
}

function utilizationSections(d: UtilizationReport): TableSection[] {
  return [
    {
      title: "Summary",
      headers: ["Metric", "Value"],
      rows: [
        ["Total Assets", d.summary.total],
        ["Utilized Assets", d.summary.utilized],
        ["Idle Assets", d.summary.idle],
        ["Utilization %", `${d.summary.utilizationPercentage}%`],
      ],
    },
    {
      title: "Most Used Assets",
      headers: ["Asset Tag", "Name", "Allocation Count"],
      rows: d.mostUsed.map((r) => [r.assetTag, r.assetName, r.allocationCount]),
    },
    {
      title: "Least Used Assets",
      headers: ["Asset Tag", "Name", "Allocation Count"],
      rows: d.leastUsed.map((r) => [r.assetTag, r.assetName, r.allocationCount]),
    },
  ];
}

function maintenanceSections(d: MaintenanceReport): TableSection[] {
  const fmtDate = (v: Date | null) => (v ? new Date(v).toISOString().slice(0, 10) : "—");
  return [
    {
      title: "Summary",
      headers: ["Metric", "Count"],
      rows: [
        ["Total Requests", d.summary.total],
        ["Pending", d.summary.pending],
        ["Approved / Technician Assigned", d.summary.approved],
        ["In Progress", d.summary.inProgress],
        ["Resolved", d.summary.resolved],
        ["Rejected", d.summary.rejected],
      ],
    },
    {
      title: "By Asset",
      headers: ["Asset Tag", "Name", "Total Requests"],
      rows: d.byAsset.map((r) => [r.assetTag ?? "—", r.assetName ?? "—", r.count]),
    },
    {
      title: "By Category",
      headers: ["Category", "Total Requests"],
      rows: d.byCategory.map((r) => [r.categoryName ?? "Uncategorised", r.count]),
    },
    {
      title: "By Department",
      headers: ["Department", "Total Requests"],
      rows: d.byDepartment.map((r) => [r.departmentName ?? "Unknown", r.count]),
    },
    {
      title: "Upcoming Maintenance",
      headers: ["Asset Tag", "Name", "Issue", "Priority", "Status"],
      rows: d.dueForMaintenance.upcoming.map((r) => [
        r.assetTag ?? "—", r.assetName ?? "—", r.issueTitle, r.priority, r.status,
      ]),
    },
    {
      title: "Overdue Maintenance (In Progress > 14 days)",
      headers: ["Asset Tag", "Name", "Issue", "Days In Progress"],
      rows: d.dueForMaintenance.overdue.map((r) => [
        r.assetTag ?? "—", r.assetName ?? "—", r.issueTitle, r.daysInProgress,
      ]),
    },
    {
      title: "Recently Serviced (Last 30 days)",
      headers: ["Asset Tag", "Name", "Issue", "Resolved Date"],
      rows: d.dueForMaintenance.recentlyServiced.map((r) => [
        r.assetTag ?? "—", r.assetName ?? "—", r.issueTitle, fmtDate(r.resolvedAt),
      ]),
    },
  ];
}

function lifecycleSections(d: LifecycleReport): TableSection[] {
  return [
    {
      title: `Asset Lifecycle (Total: ${d.total})`,
      headers: ["Status", "Count", "Percentage"],
      rows: d.byStatus.map((r) => [r.status, r.count, `${r.percentage}%`]),
    },
  ];
}

function departmentSections(d: DepartmentReport): TableSection[] {
  return [
    {
      title: "Department Allocation Summary",
      headers: ["Department", "Total Assets", "Allocated", "Available", "Bookable", "Employees"],
      rows: d.departments.map((r) => [
        r.departmentName,
        r.totalAssets,
        r.allocatedAssets,
        r.availableAssets,
        r.bookableAssets,
        r.employeeCount,
      ]),
    },
  ];
}

function bookingSections(d: BookingReport): TableSection[] {
  return [
    {
      title: "Booking Summary",
      headers: ["Metric", "Value"],
      rows: [
        ["Total Bookings", d.summary.total],
        ["Completed", d.summary.completed],
        ["Cancelled", d.summary.cancelled],
        ["Ongoing", d.summary.ongoing],
        ["Upcoming", d.summary.upcoming],
        ["Completion Rate", `${d.summary.completionRate}%`],
        ["Cancellation Rate", `${d.summary.cancellationRate}%`],
      ],
    },
    {
      title: "Bookings Per Day",
      headers: ["Date", "Bookings"],
      rows: d.perDay.map((r) => [r.date, r.count]),
    },
    {
      title: "Peak Booking Hours",
      headers: ["Time Slot", "Bookings"],
      rows: d.peakHours.map((r) => [r.label, r.count]),
    },
    {
      title: "Most Booked Resources",
      headers: ["Asset Tag", "Name", "Booking Count"],
      rows: d.mostBooked.map((r) => [r.assetTag ?? "—", r.assetName ?? "—", r.count]),
    },
    {
      title: "Least Booked Resources",
      headers: ["Asset Tag", "Name", "Booking Count"],
      rows: d.leastBooked.map((r) => [r.assetTag ?? "—", r.assetName ?? "—", r.count]),
    },
  ];
}

function auditSections(d: AuditReport): TableSection[] {
  const fmtDate = (v: Date) => new Date(v).toISOString().slice(0, 10);
  return [
    {
      title: "Audit Summary",
      headers: ["Metric", "Value"],
      rows: [
        ["Total Cycles", d.summary.total],
        ["Planned", d.summary.planned],
        ["Active", d.summary.active],
        ["Completed", d.summary.completed],
        ["Cancelled", d.summary.cancelled],
        ["Completion Rate", `${d.summary.completionRate}%`],
      ],
    },
    {
      title: "Discrepancies",
      headers: ["Type", "Count"],
      rows: [
        ["Missing Assets", d.discrepancies.missing],
        ["Damaged Assets", d.discrepancies.damaged],
        ["Resolved Discrepancies", d.discrepancies.resolvedDiscrepancies],
      ],
    },
    {
      title: "Recent Audit Cycles",
      headers: ["Name", "Status", "Scope", "Start Date", "End Date"],
      rows: d.recentCycles.map((r) => [
        r.name, r.status, r.scopeType, fmtDate(r.startDate), fmtDate(r.endDate),
      ]),
    },
  ];
}
