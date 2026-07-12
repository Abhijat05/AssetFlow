import { z } from "zod";

const notificationTypes = [
  "ASSET_ASSIGNED", "ASSET_RETURNED", "TRANSFER_REQUEST", "TRANSFER_APPROVED",
  "TRANSFER_REJECTED", "BOOKING_CREATED", "BOOKING_CANCELLED", "BOOKING_REMINDER",
  "BOOKING_COMPLETED", "MAINTENANCE_REQUEST", "MAINTENANCE_APPROVED",
  "MAINTENANCE_REJECTED", "MAINTENANCE_COMPLETED", "AUDIT_CREATED", "AUDIT_ASSIGNED",
  "AUDIT_COMPLETED", "AUDIT_DISCREPANCY", "OVERDUE_RETURN", "SYSTEM",
] as const;

const notificationPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const activityModules = [
  "ASSETS", "ALLOCATIONS", "BOOKINGS", "MAINTENANCE", "AUDITS",
  "ORGANIZATION", "AUTH", "SYSTEM",
] as const;

export const logQuerySchema = z.object({
  module: z.enum(activityModules).optional(),
  userId: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  action: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const notificationQuerySchema = z.object({
  type: z.enum(notificationTypes).optional(),
  priority: z.enum(notificationPriorities).optional(),
  isRead: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type LogQueryInput = z.infer<typeof logQuerySchema>;
export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;
