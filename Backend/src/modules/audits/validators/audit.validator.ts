import { z } from "zod";

const scopeTypes = ["ORGANIZATION", "DEPARTMENT", "LOCATION"] as const;
const auditStatuses = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
const verificationStatuses = ["VERIFIED", "MISSING", "DAMAGED"] as const;

export const createAuditCycleSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200),
    description: z.string().max(2000).optional().nullable(),
    scopeType: z.enum(scopeTypes),
    departmentId: z.string().optional().nullable(),
    location: z.string().max(500).optional().nullable(),
    startDate: z.string().datetime({ offset: true }),
    endDate: z.string().datetime({ offset: true }),
  })
  .refine((d) => d.scopeType !== "DEPARTMENT" || !!d.departmentId, {
    message: "departmentId is required for DEPARTMENT scope",
    path: ["departmentId"],
  })
  .refine((d) => d.scopeType !== "LOCATION" || !!d.location, {
    message: "location is required for LOCATION scope",
    path: ["location"],
  })
  .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });

export const updateAuditCycleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
  // Only transitions allowed in the service: PLANNED→ACTIVE, PLANNED/ACTIVE→CANCELLED
  status: z.enum(["ACTIVE", "CANCELLED"]).optional(),
});

export const assignAuditorsSchema = z.object({
  auditorIds: z
    .array(z.string().min(1))
    .min(1, "At least one auditor is required"),
});

export const verifyAssetSchema = z.object({
  verificationStatus: z.enum(verificationStatuses),
  remarks: z.string().max(1000).optional().nullable(),
});

export const auditQuerySchema = z.object({
  name: z.string().optional(),
  departmentId: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(auditStatuses).optional(),
  auditorId: z.string().optional(),
  startDateFrom: z.string().datetime({ offset: true }).optional(),
  startDateTo: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["name", "status", "startDate", "endDate", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateAuditCycleInput = z.infer<typeof createAuditCycleSchema>;
export type UpdateAuditCycleInput = z.infer<typeof updateAuditCycleSchema>;
export type AssignAuditorsInput = z.infer<typeof assignAuditorsSchema>;
export type VerifyAssetInput = z.infer<typeof verifyAssetSchema>;
export type AuditQueryInput = z.infer<typeof auditQuerySchema>;
