CREATE TYPE "public"."asset_condition" AS ENUM('NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "role" DEFAULT 'EMPLOYEE' NOT NULL,
	"status" "status" DEFAULT 'ACTIVE' NOT NULL,
	"department_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "asset_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"custom_fields" jsonb,
	"status" "status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "asset_category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "department" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_department_id" text,
	"department_head_id" text,
	"status" "status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "department_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "asset" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_tag" text NOT NULL,
	"name" text NOT NULL,
	"category_id" text NOT NULL,
	"serial_number" text,
	"description" text,
	"department_id" text NOT NULL,
	"current_location" text,
	"acquisition_date" timestamp,
	"acquisition_cost" numeric(12, 2),
	"condition" "asset_condition" DEFAULT 'NEW' NOT NULL,
	"status" "asset_status" DEFAULT 'AVAILABLE' NOT NULL,
	"is_bookable" boolean DEFAULT false NOT NULL,
	"qr_code_url" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "asset_asset_tag_unique" UNIQUE("asset_tag"),
	CONSTRAINT "asset_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "asset_attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"type" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_history" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"action" text NOT NULL,
	"performed_by" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_department_head_id_user_id_fk" FOREIGN KEY ("department_head_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_category_id_asset_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."asset_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_attachment" ADD CONSTRAINT "asset_attachment_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_attachment" ADD CONSTRAINT "asset_attachment_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_history" ADD CONSTRAINT "asset_history_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_history" ADD CONSTRAINT "asset_history_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;