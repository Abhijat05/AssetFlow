import type { AssetCondition } from "../../assets/types/index.js";

export type AllocationStatus =
  | "ACTIVE"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "OVERDUE"
  | "TRANSFER_PENDING"
  | "TRANSFERRED";

export type TransferRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface AllocationRecord {
  id: string;
  assetId: string;
  employeeId: string;
  departmentId: string;
  allocatedBy: string;
  allocatedAt: Date;
  expectedReturnDate: Date | null;
  returnedAt: Date | null;
  returnCondition: AssetCondition | null;
  returnNotes: string | null;
  status: AllocationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransferRequestRecord {
  id: string;
  assetId: string;
  requestedBy: string;
  currentHolderId: string;
  requestedEmployeeId: string | null;
  requestedDepartmentId: string | null;
  reason: string | null;
  status: TransferRequestStatus;
  approvedBy: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
