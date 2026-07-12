export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type MaintenanceStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "TECHNICIAN_ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED";

export interface MaintenanceAttachment {
  id: string;
  maintenanceRequestId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedBy: string;
  createdAt: string;
}

export interface MaintenanceHistoryEntry {
  id: string;
  assetId: string;
  action: string;
  description: string;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  reportedBy: string;
  assignedTechnicianId: string | null;
  issueTitle: string;
  issueDescription: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  approvalRemarks: string | null;
  resolutionNotes: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Joined fields from backend repository
  assetTag?: string;
  assetName?: string;
  assetDepartmentId?: string | null;
  reporterName?: string;
  technicianName?: string | null;
  approverName?: string | null;
  departmentName?: string | null;
  
  // Attachments returned by getById
  attachments?: MaintenanceAttachment[];
}

export interface MaintenanceQuery {
  search?: string;
  assetId?: string;
  reportedBy?: string;
  technicianId?: string;
  priority?: MaintenancePriority;
  status?: MaintenanceStatus;
  departmentId?: string;
  startDate?: string; // mapping to createdFrom
  endDate?: string;   // mapping to createdTo
  page?: number;
  limit?: number;
  sortBy?: "priority" | "status" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedMaintenance {
  success: boolean;
  data: MaintenanceRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateMaintenanceInput {
  assetId: string;
  issueTitle: string;
  issueDescription: string;
  priority: MaintenancePriority;
}

export interface ApproveRequestInput {
  approvalRemarks?: string | null;
}

export interface RejectRequestInput {
  approvalRemarks?: string | null;
}

export interface AssignTechnicianInput {
  technicianId: string;
}

export interface ResolveMaintenanceInput {
  resolutionNotes?: string | null;
}
