export type AssetCondition = "NEW" | "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "DAMAGED";
export type AssetStatus = "AVAILABLE" | "IN_USE" | "UNDER_MAINTENANCE" | "RETIRED" | "LOST";

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  description: string | null;
  categoryId: string;
  category?: { id: string; name: string };
  departmentId: string | null;
  department?: { id: string; name: string } | null;
  serialNumber: string | null;
  condition: AssetCondition;
  status: AssetStatus;
  currentLocation: string | null;
  acquisitionDate: string | null;
  acquisitionCost: number | null;
  isBookable: boolean;
  photoUrl: string | null;
  documents: AssetDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetDocument {
  id: string;
  assetId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface AssetHistoryEntry {
  id: string;
  assetId: string;
  action: string;
  description: string;
  performedBy: string;
  performedByName: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AssetQuery {
  search?: string;
  categoryId?: string;
  departmentId?: string;
  status?: AssetStatus;
  condition?: AssetCondition;
  isBookable?: boolean;
  currentLocation?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "assetTag" | "condition" | "status" | "createdAt" | "acquisitionDate";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedAssets {
  success: boolean;
  data: Asset[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RegisterAssetInput {
  name: string;
  categoryId: string;
  departmentId?: string | null;
  serialNumber?: string | null;
  description?: string | null;
  currentLocation?: string | null;
  acquisitionDate?: string | null;
  acquisitionCost?: number | null;
  condition: AssetCondition;
  isBookable: boolean;
}
