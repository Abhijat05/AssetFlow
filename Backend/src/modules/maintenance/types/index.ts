export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type MaintenanceStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "TECHNICIAN_ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED";

export const ACTIVE_MAINTENANCE_STATUSES: MaintenanceStatus[] = [
  "PENDING",
  "APPROVED",
  "TECHNICIAN_ASSIGNED",
  "IN_PROGRESS",
];
