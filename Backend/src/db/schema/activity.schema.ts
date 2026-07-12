import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { notificationTypeEnum, notificationPriorityEnum } from "./enums.js";
import { user } from "./auth.schema.js";

export const activityLog = pgTable("activity_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  action: text("action").notNull(),
  module: text("module").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  description: text("description"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").notNull(),
  priority: notificationPriorityEnum("priority").notNull().default("MEDIUM"),
  referenceType: text("reference_type"),
  referenceId: text("reference_id"),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
