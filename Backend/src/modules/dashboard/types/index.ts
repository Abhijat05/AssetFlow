export type KpiData = {
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
};

export type QuickActions = {
  registerAsset: boolean;
  allocateAsset: boolean;
  bookResource: boolean;
  raiseMaintenanceRequest: boolean;
  createAudit: boolean;
  createDepartment: boolean;
};
