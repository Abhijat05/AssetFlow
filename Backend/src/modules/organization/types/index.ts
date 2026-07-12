import type { Role, UserStatus } from "../../../types/index.js";

export type OrgStatus = "ACTIVE" | "INACTIVE";

export interface Department {
  id: string;
  name: string;
  description: string | null;
  parentDepartmentId: string | null;
  departmentHeadId: string | null;
  status: OrgStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetCategory {
  id: string;
  name: string;
  description: string | null;
  customFields: Record<string, unknown> | null;
  status: OrgStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: Role;
  status: UserStatus;
  departmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
