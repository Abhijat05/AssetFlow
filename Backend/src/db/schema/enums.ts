import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "ADMIN",
  "ASSET_MANAGER",
  "DEPARTMENT_HEAD",
  "EMPLOYEE",
]);

export const statusEnum = pgEnum("status", ["ACTIVE", "INACTIVE"]);

export const assetConditionEnum = pgEnum("asset_condition", [
  "NEW",
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "POOR",
  "DAMAGED",
]);

export const assetStatusEnum = pgEnum("asset_status", [
  "AVAILABLE",
  "ALLOCATED",
  "RESERVED",
  "UNDER_MAINTENANCE",
  "LOST",
  "RETIRED",
  "DISPOSED",
]);

export const allocationStatusEnum = pgEnum("allocation_status", [
  "ACTIVE",
  "RETURN_REQUESTED",
  "RETURNED",
  "OVERDUE",
  "TRANSFER_PENDING",
  "TRANSFERRED",
]);

export const transferRequestStatusEnum = pgEnum("transfer_request_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
]);

export const auditStatusEnum = pgEnum("audit_status", [
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const auditScopeTypeEnum = pgEnum("audit_scope_type", [
  "ORGANIZATION",
  "DEPARTMENT",
  "LOCATION",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "VERIFIED",
  "MISSING",
  "DAMAGED",
]);

export const maintenancePriorityEnum = pgEnum("maintenance_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "TECHNICIAN_ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "ASSET_ASSIGNED",
  "ASSET_RETURNED",
  "TRANSFER_REQUEST",
  "TRANSFER_APPROVED",
  "TRANSFER_REJECTED",
  "BOOKING_CREATED",
  "BOOKING_CANCELLED",
  "BOOKING_REMINDER",
  "BOOKING_COMPLETED",
  "MAINTENANCE_REQUEST",
  "MAINTENANCE_APPROVED",
  "MAINTENANCE_REJECTED",
  "MAINTENANCE_COMPLETED",
  "AUDIT_CREATED",
  "AUDIT_ASSIGNED",
  "AUDIT_COMPLETED",
  "AUDIT_DISCREPANCY",
  "OVERDUE_RETURN",
  "SYSTEM",
]);

export const notificationPriorityEnum = pgEnum("notification_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);
