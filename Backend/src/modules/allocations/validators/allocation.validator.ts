import { z } from "zod";

const allocationStatuses = [
  "ACTIVE",
  "RETURN_REQUESTED",
  "RETURNED",
  "OVERDUE",
  "TRANSFER_PENDING",
  "TRANSFERRED",
] as const;

const transferStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const;

const assetConditions = ["NEW", "EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"] as const;

export const allocateAssetSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  employeeId: z.string().min(1, "Employee is required"),
  departmentId: z.string().min(1, "Department is required"),
  expectedReturnDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable()
    .refine(
      (val) => !val || new Date(val) > new Date(),
      "Expected return date must be in the future"
    ),
});

export const approveReturnSchema = z.object({
  returnCondition: z.enum(assetConditions),
  returnNotes: z.string().max(1000).optional().nullable(),
});

export const createTransferRequestSchema = z
  .object({
    assetId: z.string().min(1, "Asset is required"),
    requestedEmployeeId: z.string().optional().nullable(),
    requestedDepartmentId: z.string().optional().nullable(),
    reason: z.string().max(1000).optional().nullable(),
  })
  .refine(
    (d) => d.requestedEmployeeId || d.requestedDepartmentId,
    "At least one of requestedEmployeeId or requestedDepartmentId is required"
  );

export const rejectTransferSchema = z.object({
  reason: z.string().max(1000).optional().nullable(),
});

export const allocationQuerySchema = z.object({
  assetId: z.string().optional(),
  employeeId: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.enum(allocationStatuses).optional(),
  expectedReturnDateFrom: z.string().datetime({ offset: true }).optional(),
  expectedReturnDateTo: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["allocatedAt", "expectedReturnDate", "status", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const transferQuerySchema = z.object({
  assetId: z.string().optional(),
  requestedBy: z.string().optional(),
  status: z.enum(transferStatuses).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AllocateAssetInput = z.infer<typeof allocateAssetSchema>;
export type ApproveReturnInput = z.infer<typeof approveReturnSchema>;
export type CreateTransferRequestInput = z.infer<typeof createTransferRequestSchema>;
export type RejectTransferInput = z.infer<typeof rejectTransferSchema>;
export type AllocationQueryInput = z.infer<typeof allocationQuerySchema>;
export type TransferQueryInput = z.infer<typeof transferQuerySchema>;
