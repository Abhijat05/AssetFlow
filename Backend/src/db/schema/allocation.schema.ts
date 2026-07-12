import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { allocationStatusEnum, assetConditionEnum, transferRequestStatusEnum } from "./enums.js";
import { user } from "./auth.schema.js";
import { department } from "./org.schema.js";
import { asset } from "./asset.schema.js";

export const assetAllocation = pgTable("asset_allocation", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => asset.id),
  employeeId: text("employee_id")
    .notNull()
    .references(() => user.id),
  departmentId: text("department_id")
    .notNull()
    .references(() => department.id),
  allocatedBy: text("allocated_by")
    .notNull()
    .references(() => user.id),
  allocatedAt: timestamp("allocated_at").notNull().defaultNow(),
  expectedReturnDate: timestamp("expected_return_date"),
  returnedAt: timestamp("returned_at"),
  returnCondition: assetConditionEnum("return_condition"),
  returnNotes: text("return_notes"),
  status: allocationStatusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const transferRequest = pgTable("transfer_request", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => asset.id),
  requestedBy: text("requested_by")
    .notNull()
    .references(() => user.id),
  currentHolderId: text("current_holder_id")
    .notNull()
    .references(() => user.id),
  requestedEmployeeId: text("requested_employee_id").references(() => user.id),
  requestedDepartmentId: text("requested_department_id").references(() => department.id),
  reason: text("reason"),
  status: transferRequestStatusEnum("status").notNull().default("PENDING"),
  approvedBy: text("approved_by").references(() => user.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
