export type AssetCondition = "NEW" | "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "DAMAGED";

export type AssetStatus =
  | "AVAILABLE"
  | "ALLOCATED"
  | "RESERVED"
  | "UNDER_MAINTENANCE"
  | "LOST"
  | "RETIRED"
  | "DISPOSED";

export type AttachmentType = "photo" | "warranty" | "invoice" | "manual" | "document";

export interface AssetRecord {
  id: string;
  assetTag: string;
  name: string;
  categoryId: string;
  serialNumber: string | null;
  description: string | null;
  departmentId: string;
  currentLocation: string | null;
  acquisitionDate: Date | null;
  acquisitionCost: string | null; // numeric comes back as string from postgres
  condition: AssetCondition;
  status: AssetStatus;
  isBookable: boolean;
  qrCodeUrl: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetAttachmentRecord {
  id: string;
  assetId: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedBy: string;
  createdAt: Date;
}

export interface AssetHistoryRecord {
  id: string;
  assetId: string;
  action: string;
  performedBy: string;
  timestamp: Date;
  metadata: Record<string, unknown> | null;
}
