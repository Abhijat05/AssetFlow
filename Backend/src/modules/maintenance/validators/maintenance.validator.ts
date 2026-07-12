import { z } from "zod";

const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const statuses = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "TECHNICIAN_ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
] as const;

export const createMaintenanceRequestSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  issueTitle: z.string().min(1, "Issue title is required").max(200),
  issueDescription: z.string().min(1, "Issue description is required").max(2000),
  priority: z.enum(priorities).default("MEDIUM"),
});

export const approveRequestSchema = z.object({
  approvalRemarks: z.string().max(1000).optional().nullable(),
});

export const rejectRequestSchema = z.object({
  approvalRemarks: z.string().max(1000).optional().nullable(),
});

export const assignTechnicianSchema = z.object({
  technicianId: z.string().min(1, "Technician is required"),
});

export const resolveMaintenanceSchema = z.object({
  resolutionNotes: z.string().max(2000).optional().nullable(),
});

export const maintenanceQuerySchema = z.object({
  assetId: z.string().optional(),
  reportedBy: z.string().optional(),
  technicianId: z.string().optional(),
  priority: z.enum(priorities).optional(),
  status: z.enum(statuses).optional(),
  departmentId: z.string().optional(),
  createdFrom: z.string().datetime({ offset: true }).optional(),
  createdTo: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["priority", "status", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateMaintenanceRequestInput = z.infer<typeof createMaintenanceRequestSchema>;
export type ApproveRequestInput = z.infer<typeof approveRequestSchema>;
export type RejectRequestInput = z.infer<typeof rejectRequestSchema>;
export type AssignTechnicianInput = z.infer<typeof assignTechnicianSchema>;
export type ResolveMaintenanceInput = z.infer<typeof resolveMaintenanceSchema>;
export type MaintenanceQueryInput = z.infer<typeof maintenanceQuerySchema>;
