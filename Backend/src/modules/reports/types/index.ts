export type ExportFormat = "pdf" | "xlsx" | "csv";
export type ReportType =
  | "utilization"
  | "maintenance"
  | "lifecycle"
  | "bookings"
  | "departments"
  | "audits";

export type UtilizationReport = {
  summary: {
    total: number;
    utilized: number;
    idle: number;
    utilizationPercentage: number;
  };
  mostUsed: { assetId: string; assetTag: string; assetName: string; allocationCount: number }[];
  leastUsed: { assetId: string; assetTag: string; assetName: string; allocationCount: number }[];
};

export type MaintenanceReport = {
  summary: {
    total: number;
    pending: number;
    approved: number;
    inProgress: number;
    resolved: number;
    rejected: number;
  };
  byAsset: { assetId: string | null; assetTag: string | null; assetName: string | null; count: number }[];
  byCategory: { categoryId: string | null; categoryName: string | null; count: number }[];
  byDepartment: { departmentId: string | null; departmentName: string | null; count: number }[];
  dueForMaintenance: {
    upcoming: {
      requestId: string;
      assetId: string;
      assetTag: string | null;
      assetName: string | null;
      issueTitle: string;
      priority: string;
      status: string;
    }[];
    overdue: {
      requestId: string;
      assetId: string;
      assetTag: string | null;
      assetName: string | null;
      issueTitle: string;
      daysInProgress: number;
    }[];
    recentlyServiced: {
      requestId: string;
      assetId: string;
      assetTag: string | null;
      assetName: string | null;
      issueTitle: string;
      resolvedAt: Date | null;
    }[];
  };
};

export type LifecycleReport = {
  total: number;
  byStatus: { status: string; count: number; percentage: number }[];
};

export type DepartmentReport = {
  departments: {
    departmentId: string;
    departmentName: string;
    totalAssets: number;
    allocatedAssets: number;
    availableAssets: number;
    bookableAssets: number;
    employeeCount: number;
  }[];
};

export type BookingReport = {
  summary: {
    total: number;
    completed: number;
    cancelled: number;
    ongoing: number;
    upcoming: number;
    completionRate: number;
    cancellationRate: number;
  };
  perDay: { date: string; count: number }[];
  peakHours: { hour: number; label: string; count: number }[];
  mostBooked: { assetId: string; assetTag: string | null; assetName: string | null; count: number }[];
  leastBooked: { assetId: string; assetTag: string | null; assetName: string | null; count: number }[];
};

export type AuditReport = {
  summary: {
    total: number;
    planned: number;
    active: number;
    completed: number;
    cancelled: number;
    completionRate: number;
  };
  discrepancies: {
    missing: number;
    damaged: number;
    resolvedDiscrepancies: number;
  };
  recentCycles: {
    id: string;
    name: string;
    status: string;
    scopeType: string;
    startDate: Date;
    endDate: Date;
  }[];
};

// Used by exporters — a generic flat table format
export type TableSection = {
  title: string;
  headers: string[];
  rows: (string | number | null)[][];
};
