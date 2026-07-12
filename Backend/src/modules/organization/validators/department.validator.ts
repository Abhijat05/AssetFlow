import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  parentDepartmentId: z.string().optional().nullable(),
  departmentHeadId: z.string().optional().nullable(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  parentDepartmentId: z.string().optional().nullable(),
  departmentHeadId: z.string().optional().nullable(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
