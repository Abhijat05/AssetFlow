import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "ADMIN",
  "ASSET_MANAGER",
  "DEPARTMENT_HEAD",
  "EMPLOYEE",
]);

export const statusEnum = pgEnum("status", ["ACTIVE", "INACTIVE"]);
