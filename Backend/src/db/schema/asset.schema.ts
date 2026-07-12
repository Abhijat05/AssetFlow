import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { assetConditionEnum, assetStatusEnum } from "./enums.js";
import { user } from "./auth.schema.js";
import { department, assetCategory } from "./org.schema.js";

export const asset = pgTable("asset", {
  id: text("id").primaryKey(),
  assetTag: text("asset_tag").notNull().unique(),
  name: text("name").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => assetCategory.id),
  serialNumber: text("serial_number").unique(),
  description: text("description"),
  departmentId: text("department_id")
    .notNull()
    .references(() => department.id),
  currentLocation: text("current_location"),
  acquisitionDate: timestamp("acquisition_date"),
  acquisitionCost: numeric("acquisition_cost", { precision: 12, scale: 2 }),
  condition: assetConditionEnum("condition").notNull().default("NEW"),
  status: assetStatusEnum("status").notNull().default("AVAILABLE"),
  isBookable: boolean("is_bookable").notNull().default(false),
  qrCodeUrl: text("qr_code_url"),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const assetAttachment = pgTable("asset_attachment", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => asset.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "photo" | "warranty" | "invoice" | "manual" | "document"
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const assetHistory = pgTable("asset_history", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => asset.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  performedBy: text("performed_by")
    .notNull()
    .references(() => user.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});
