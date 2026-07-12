export type ExportFormat = "pdf" | "xlsx" | "csv";
export type ReportType =
  | "utilization"
  | "maintenance"
  | "lifecycle"
  | "bookings"
  | "departments"
  | "audits";

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  departmentId?: string;
  categoryId?: string;
  assetId?: string;
  employeeId?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface UtilizationReportData {
  summary: {
    total: number;
    utilized: number;
    idle: number;
    utilizationPercentage: number;
  };
  mostUsed: {
    assetId: string;
    assetTag: string;
    assetName: string;
    allocationCount: number;
  }[];
  leastUsed: {
    assetId: string;
    assetTag: string;
    assetName: string;
    allocationCount: number;
  }[];
}

export interface MaintenanceReportData {
  summary: {
    total: number;
    pending: number;
    approved: number;
    inProgress: number;
    resolved: number;
    rejected: number;
  };
  byAsset: {
    assetId: string | null;
    assetTag: string | null;
    assetName: string | null;
    count: number;
  }[];
  byCategory: {
    categoryId: string | null;
    categoryName: string | null;
    count: number;
  }[];
  byDepartment: {
    departmentId: string | null;
    departmentName: string | null;
    count: number;
  }[];
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
      resolvedAt: string | null;
    }[];
  };
}

export interface LifecycleReportData {
  total: number;
  byStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

export interface DepartmentReportData {
  departments: {
    departmentId: string;
    departmentName: string;
    totalAssets: number;
    allocatedAssets: number;
    availableAssets: number;
    bookableAssets: number;
    employeeCount: number;
  }[];
}

export interface BookingReportData {
  summary: {
    total: number;
    completed: number;
    cancelled: number;
    ongoing: number;
    upcoming: number;
    completionRate: number;
    cancellationRate: number;
  };
  perDay: {
    date: string;
    count: number;
  }[];
  peakHours: {
    hour: number;
    label: string;
    count: number;
  }[];
  mostBooked: {
    assetId: string;
    assetTag: string | null;
    assetName: string | null;
    count: number;
  }[];
  leastBooked: {
    assetId: string;
    assetTag: string | null;
    assetName: string | null;
    count: number;
  }[];
}

export interface AuditReportData {
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
    startDate: string;
    endDate: string;
  }[];
}
