import { z } from "zod";

const assetConditions = ["NEW", "EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"] as const;
const assetStatuses = [
  "AVAILABLE",
  "ALLOCATED",
  "RESERVED",
  "UNDER_MAINTENANCE",
  "LOST",
  "RETIRED",
  "DISPOSED",
] as const;
const attachmentTypes = ["photo", "warranty", "invoice", "manual", "document"] as const;

export const createAssetSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  categoryId: z.string().min(1, "Category is required"),
  serialNumber: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  departmentId: z.string().min(1, "Department is required"),
  currentLocation: z.string().max(300).optional().nullable(),
  acquisitionDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable()
    .refine(
      (val) => !val || new Date(val) <= new Date(),
      "Acquisition date cannot be in the future"
    ),
  acquisitionCost: z
    .number({ error: "Acquisition cost must be a number" })
    .positive("Acquisition cost must be positive")
    .optional()
    .nullable(),
  condition: z.enum(assetConditions).default("NEW"),
  isBookable: z.boolean().default(false),
});

export const updateAssetSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  categoryId: z.string().optional(),
  serialNumber: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  departmentId: z.string().optional(),
  currentLocation: z.string().max(300).optional().nullable(),
  acquisitionDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable()
    .refine(
      (val) => !val || new Date(val) <= new Date(),
      "Acquisition date cannot be in the future"
    ),
  acquisitionCost: z
    .number()
    .positive("Acquisition cost must be positive")
    .optional()
    .nullable(),
  condition: z.enum(assetConditions).optional(),
  status: z.enum(assetStatuses).optional(),
  isBookable: z.boolean().optional(),
});

export const assetQuerySchema = z.object({
  assetTag: z.string().optional(),
  name: z.string().optional(),
  serialNumber: z.string().optional(),
  departmentId: z.string().optional(),
  categoryId: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(assetStatuses).optional(),
  condition: z.enum(assetConditions).optional(),
  isBookable: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["name", "assetTag", "status", "condition", "acquisitionDate", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const uploadAttachmentSchema = z.object({
  type: z.enum(attachmentTypes),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type AssetQueryInput = z.infer<typeof assetQuerySchema>;
export type UploadAttachmentInput = z.infer<typeof uploadAttachmentSchema>;
