import { z } from "zod";

export const reportFilterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  departmentId: z.string().optional(),
  categoryId: z.string().optional(),
  assetId: z.string().optional(),
  employeeId: z.string().optional(),
  location: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(50),
});

export const exportQuerySchema = reportFilterSchema.extend({
  report: z.enum(["utilization", "maintenance", "lifecycle", "bookings", "departments", "audits"]),
  format: z.enum(["pdf", "xlsx", "csv"]),
});

export type ReportFilterInput = z.infer<typeof reportFilterSchema>;
export type ExportQueryInput = z.infer<typeof exportQuerySchema>;
