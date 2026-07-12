export type AuditStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type AuditScopeType = "ORGANIZATION" | "DEPARTMENT" | "LOCATION";
export type VerificationStatus = "VERIFIED" | "MISSING" | "DAMAGED";

export interface AuditAssignment {
  id: string;
  auditCycleId: string;
  auditorId: string;
  assignedAt: string;
  auditorName?: string;
  auditorEmail?: string;
}

export interface AuditRecord {
  id: string;
  auditCycleId: string;
  assetId: string;
  verifiedBy: string | null;
  verificationStatus: VerificationStatus | null;
  remarks: string | null;
  verifiedAt: string | null;
  
  // Joined fields
  assetTag?: string;
  assetName?: string;
  assetStatus?: string;
  assetLocation?: string | null;
  departmentName?: string | null;
  verifierName?: string | null;
}

export interface AuditRecordStats {
  total: number;
  verified: number;
  missing: number;
  damaged: number;
  unverified: number;
}

export interface AuditCycle {
  id: string;
  name: string;
  description: string | null;
  scopeType: AuditScopeType;
  departmentId: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
  status: AuditStatus;
  createdBy: string;
  closedBy: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Joined / aggregated details
  creatorName?: string;
  closerName?: string;
  departmentName?: string | null;
  auditors?: AuditAssignment[];
  stats?: AuditRecordStats;
  records?: { record: AuditRecord; assetTag: string; assetName: string; assetStatus: string; assetLocation: string | null; departmentName: string | null; verifierName: string | null }[];
}

export interface DiscrepancyReport {
  auditCycle: {
    cycle: AuditCycle;
    creatorName?: string;
    closerName?: string;
    departmentName?: string | null;
  };
  stats: AuditRecordStats;
  missing: {
    record: AuditRecord;
    assetTag: string;
    assetName: string;
    assetStatus: string;
    assetLocation: string | null;
    verifierName: string | null;
  }[];
  damaged: {
    record: AuditRecord;
    assetTag: string;
    assetName: string;
    assetStatus: string;
    assetLocation: string | null;
    verifierName: string | null;
  }[];
  generatedAt: string;
}

export interface AuditQuery {
  name?: string;
  departmentId?: string;
  location?: string;
  status?: AuditStatus;
  auditorId?: string;
  startDate?: string; // mapped to startDateFrom
  endDate?: string;   // mapped to startDateTo
  page?: number;
  limit?: number;
  sortBy?: "name" | "status" | "startDate" | "endDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedAudits {
  success: boolean;
  data: {
    cycle: AuditCycle;
    creatorName?: string;
    departmentName?: string | null;
  }[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateAuditInput {
  name: string;
  description?: string | null;
  scopeType: AuditScopeType;
  departmentId?: string | null;
  location?: string | null;
  startDate: string;
  endDate: string;
  auditorIds: string[];
}

export interface UpdateAuditInput {
  name?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  status?: "ACTIVE" | "CANCELLED";
}

export interface VerifyAssetInput {
  verificationStatus: VerificationStatus;
  remarks?: string | null;
}
