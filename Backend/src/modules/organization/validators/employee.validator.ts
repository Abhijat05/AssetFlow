import { z } from "zod";

const roleValues = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] as const;
const statusValues = ["ACTIVE", "INACTIVE"] as const;
const sortByValues = ["name", "email", "role", "status", "createdAt"] as const;

export const updateRoleSchema = z.object({
  role: z.enum(roleValues),
  departmentId: z.string().optional().nullable(),
});

export const updateDepartmentSchema = z.object({
  departmentId: z.string().nullable(),
});

export const updateStatusSchema = z.object({
  status: z.enum(statusValues),
});

export const employeeQuerySchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  departmentId: z.string().optional(),
  role: z.enum(roleValues).optional(),
  status: z.enum(statusValues).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(sortByValues).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>;
