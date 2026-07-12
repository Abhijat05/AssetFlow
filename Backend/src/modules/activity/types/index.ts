export type NotificationType =
  | "ASSET_ASSIGNED"
  | "ASSET_RETURNED"
  | "TRANSFER_REQUEST"
  | "TRANSFER_APPROVED"
  | "TRANSFER_REJECTED"
  | "BOOKING_CREATED"
  | "BOOKING_CANCELLED"
  | "BOOKING_REMINDER"
  | "BOOKING_COMPLETED"
  | "MAINTENANCE_REQUEST"
  | "MAINTENANCE_APPROVED"
  | "MAINTENANCE_REJECTED"
  | "MAINTENANCE_COMPLETED"
  | "AUDIT_CREATED"
  | "AUDIT_ASSIGNED"
  | "AUDIT_COMPLETED"
  | "AUDIT_DISCREPANCY"
  | "OVERDUE_RETURN"
  | "SYSTEM";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ActivityModule =
  | "ASSETS"
  | "ALLOCATIONS"
  | "BOOKINGS"
  | "MAINTENANCE"
  | "AUDITS"
  | "ORGANIZATION"
  | "AUTH"
  | "SYSTEM";

export interface LogInput {
  userId?: string | null;
  action: string;
  module: ActivityModule;
  entityType?: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface NotificationInput {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  referenceType?: string;
  referenceId?: string;
}
