export type AllocationStatus =
  | "ACTIVE"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "OVERDUE"
  | "TRANSFER_PENDING"
  | "TRANSFERRED";

export interface Allocation {
  id: string;
  assetId: string;
  asset: {
    id: string;
    name: string;
    assetTag: string;
    condition: string;
  };
  employeeId: string | null;
  employee: {
    id: string;
    name: string;
    email: string;
  } | null;
  departmentId: string | null;
  department: {
    id: string;
    name: string;
  } | null;
  allocatedAt: string;
  expectedReturnDate: string | null;
  returnedAt: string | null;
  status: AllocationStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransferRequest {
  id: string;
  allocationId: string;
  allocation?: Allocation;
  requestingEmployeeId: string;
  requestingEmployee: {
    id: string;
    name: string;
    email: string;
  };
  targetEmployeeId: string;
  targetEmployee: {
    id: string;
    name: string;
    email: string;
  };
  targetDepartmentId: string | null;
  targetDepartment: {
    id: string;
    name: string;
  } | null;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface AllocationHistoryEntry {
  id: string;
  allocationId: string;
  action: string;
  description: string;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

export interface AllocationQuery {
  search?: string;
  status?: AllocationStatus;
  departmentId?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  expectedReturnDateFrom?: string;
  expectedReturnDateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedAllocations {
  success: boolean;
  data: Allocation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AllocateAssetInput {
  assetId: string;
  employeeId?: string | null;
  departmentId?: string | null;
  expectedReturnDate?: string | null;
  notes?: string | null;
}

export interface RequestTransferInput {
  targetEmployeeId: string;
  targetDepartmentId?: string | null;
  reason: string;
}

export interface RequestReturnInput {
  returnCondition: string;
  returnNotes?: string | null;
}
