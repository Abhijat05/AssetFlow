import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { statusEnum } from "./enums.js";
import { user } from "./auth.schema.js";

export const department = pgTable("department", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  parentDepartmentId: text("parent_department_id"),
  departmentHeadId: text("department_head_id").references(() => user.id, {
    onDelete: "set null",
  }),
  status: statusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const assetCategory = pgTable("asset_category", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
  status: statusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
