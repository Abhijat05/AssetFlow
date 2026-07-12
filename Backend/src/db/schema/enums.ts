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
