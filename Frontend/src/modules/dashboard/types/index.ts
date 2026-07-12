export interface KpiData {
  assetsAvailable: number;
  assetsAllocated: number;
  assetsUnderMaintenance: number;
  assetsReserved: number;
  assetsLost: number;
  assetsRetired: number;
  activeBookings: number;
  todaysBookings: number;
  pendingTransferRequests: number;
  pendingMaintenanceRequests: number;
  upcomingReturns: number;
  overdueReturns: number;
  activeAuditCycles: number;
  completedAuditCycles: number;
}

export interface QuickActions {
  registerAsset: boolean;
  allocateAsset: boolean;
  bookResource: boolean;
  raiseMaintenanceRequest: boolean;
  createAudit: boolean;
  createDepartment: boolean;
}

export interface DashboardActivity {
  id: string;
  assetId: string | null;
  assetTag: string | null;
  assetName: string | null;
  action: string;
  performedBy: string | null;
  performedByName: string | null;
  timestamp: string;
  metadata: Record<string, unknown> | null;
}

export interface OverdueReturnItem {
  allocationId: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  employeeId: string;
  employeeName: string;
  departmentName: string | null;
  expectedReturnDate: string;
  daysOverdue: number;
}

export interface UpcomingReturnItem {
  allocationId: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  employeeId: string;
  employeeName: string;
  departmentName: string | null;
  expectedReturnDate: string;
}

export interface DashboardBookingItem {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  bookedBy: string;
  bookedByName: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ONGOING" | "COMPLETED" | "CANCELLED" | "UPCOMING";
  purpose: string | null;
}

export interface DashboardMaintenanceStats {
  pending: number;
  approved: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}

export interface DashboardAuditStats {
  planned: number;
  active: number;
  completed: number;
  discrepancies: number;
}

export interface DashboardData {
  kpis: KpiData;
  quickActions: QuickActions;
  activity: DashboardActivity[];
  returns: {
    overdue: OverdueReturnItem[];
    upcoming: UpcomingReturnItem[];
  };
  bookings: {
    today: DashboardBookingItem[];
    ongoing: DashboardBookingItem[];
    upcoming: DashboardBookingItem[];
  };
  maintenance: DashboardMaintenanceStats;
  audits: DashboardAuditStats;
}
