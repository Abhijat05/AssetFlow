export type AuditStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type AuditScopeType = "ORGANIZATION" | "DEPARTMENT" | "LOCATION";
export type VerificationStatus = "VERIFIED" | "MISSING" | "DAMAGED";

// Statuses in which the audit can still be modified
export const MUTABLE_AUDIT_STATUSES: AuditStatus[] = ["PLANNED", "ACTIVE"];
