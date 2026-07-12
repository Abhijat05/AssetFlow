import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { bookingStatusEnum } from "./enums.js";
import { user } from "./auth.schema.js";
import { department } from "./org.schema.js";
import { asset } from "./asset.schema.js";

export const booking = pgTable("booking", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => asset.id),
  bookedBy: text("booked_by")
    .notNull()
    .references(() => user.id),
  departmentId: text("department_id")
    .notNull()
    .references(() => department.id),
  title: text("title").notNull(),
  purpose: text("purpose"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: bookingStatusEnum("status").notNull().default("UPCOMING"),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
