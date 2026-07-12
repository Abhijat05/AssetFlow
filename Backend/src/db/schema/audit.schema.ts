import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { auditStatusEnum, auditScopeTypeEnum, verificationStatusEnum } from "./enums.js";
import { user } from "./auth.schema.js";
import { department } from "./org.schema.js";
import { asset } from "./asset.schema.js";

export const auditCycle = pgTable("audit_cycle", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  scopeType: auditScopeTypeEnum("scope_type").notNull(),
  departmentId: text("department_id").references(() => department.id),
  location: text("location"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: auditStatusEnum("status").notNull().default("PLANNED"),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  closedBy: text("closed_by").references(() => user.id),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const auditAssignment = pgTable("audit_assignment", {
  id: text("id").primaryKey(),
  auditCycleId: text("audit_cycle_id")
    .notNull()
    .references(() => auditCycle.id, { onDelete: "cascade" }),
  auditorId: text("auditor_id")
    .notNull()
    .references(() => user.id),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

export const auditRecord = pgTable("audit_record", {
  id: text("id").primaryKey(),
  auditCycleId: text("audit_cycle_id")
    .notNull()
    .references(() => auditCycle.id, { onDelete: "cascade" }),
  assetId: text("asset_id")
    .notNull()
    .references(() => asset.id),
  verifiedBy: text("verified_by").references(() => user.id),
  verificationStatus: verificationStatusEnum("verification_status"),
  remarks: text("remarks"),
  verifiedAt: timestamp("verified_at"),
});
