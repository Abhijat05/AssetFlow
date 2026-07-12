CREATE TYPE "public"."notification_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('ASSET_ASSIGNED', 'ASSET_RETURNED', 'TRANSFER_REQUEST', 'TRANSFER_APPROVED', 'TRANSFER_REJECTED', 'BOOKING_CREATED', 'BOOKING_CANCELLED', 'BOOKING_REMINDER', 'BOOKING_COMPLETED', 'MAINTENANCE_REQUEST', 'MAINTENANCE_APPROVED', 'MAINTENANCE_REJECTED', 'MAINTENANCE_COMPLETED', 'AUDIT_CREATED', 'AUDIT_ASSIGNED', 'AUDIT_COMPLETED', 'AUDIT_DISCREPANCY', 'OVERDUE_RETURN', 'SYSTEM');--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"module" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"description" text,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"priority" "notification_priority" DEFAULT 'MEDIUM' NOT NULL,
	"reference_type" text,
	"reference_id" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
