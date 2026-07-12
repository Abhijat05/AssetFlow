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

export interface ActivityLog {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  module: ActivityModule;
  entityType: string | null;
  entityId: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ActivityQuery {
  module?: ActivityModule;
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  referenceType: string | null;
  referenceId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationQuery {
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}
