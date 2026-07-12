import type { UserRole } from "../../../types/auth";

export interface Department {
  id: string;
  name: string;
  description: string | null;
  parentDepartmentId: string | null;
  departmentHeadId: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  description: string | null;
  customFields: Record<string, unknown> | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
  departmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeQuery {
  name?: string;
  email?: string;
  departmentId?: string;
  role?: UserRole;
  status?: "ACTIVE" | "INACTIVE";
  page?: number;
  limit?: number;
  sortBy?: "name" | "email" | "role" | "status" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
