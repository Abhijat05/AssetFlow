import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { maintenancePriorityEnum, maintenanceStatusEnum } from "./enums.js";
import { user } from "./auth.schema.js";
import { asset } from "./asset.schema.js";

export const maintenanceRequest = pgTable("maintenance_request", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => asset.id),
  reportedBy: text("reported_by")
    .notNull()
    .references(() => user.id),
  assignedTechnicianId: text("assigned_technician_id").references(() => user.id),
  issueTitle: text("issue_title").notNull(),
  issueDescription: text("issue_description").notNull(),
  priority: maintenancePriorityEnum("priority").notNull().default("MEDIUM"),
  status: maintenanceStatusEnum("status").notNull().default("PENDING"),
  approvalRemarks: text("approval_remarks"),
  resolutionNotes: text("resolution_notes"),
  approvedBy: text("approved_by").references(() => user.id),
  approvedAt: timestamp("approved_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const maintenanceAttachment = pgTable("maintenance_attachment", {
  id: text("id").primaryKey(),
  maintenanceRequestId: text("maintenance_request_id")
    .notNull()
    .references(() => maintenanceRequest.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
