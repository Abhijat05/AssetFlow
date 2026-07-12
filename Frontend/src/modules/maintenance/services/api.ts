import type {
  MaintenanceRequest,
  MaintenanceQuery,
  PaginatedMaintenance,
  CreateMaintenanceInput,
  ApproveRequestInput,
  RejectRequestInput,
  AssignTechnicianInput,
  ResolveMaintenanceInput,
  MaintenanceAttachment,
  MaintenanceHistoryEntry,
} from "../types";

interface BackendMaintenanceRow {
  request: {
    id: string;
    assetId: string;
    reportedBy: string;
    assignedTechnicianId: string | null;
    issueTitle: string;
    issueDescription: string;
    priority: MaintenanceRequest["priority"];
    status: MaintenanceRequest["status"];
    approvalRemarks: string | null;
    resolutionNotes: string | null;
    approvedBy: string | null;
    approvedAt: string | null;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  assetTag: string;
  assetName: string;
  assetDepartmentId: string | null;
  reporterName: string;
  technicianName: string | null;
  approverName?: string | null;
  departmentName: string | null;
  attachments?: MaintenanceAttachment[];
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  Object.assign(headers, options.headers || {});

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json = {} as T & { error?: string; message?: string };
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // Ignore JSON parsing errors
  }

  if (!response.ok) {
    throw new Error(json.error || json.message || `Request failed with status ${response.status}`);
  }

  return json as T;
}

function mapBackendRow(row: BackendMaintenanceRow): MaintenanceRequest {
  const req = row.request || {};
  return {
    ...req,
    assetTag: row.assetTag,
    assetName: row.assetName,
    assetDepartmentId: row.assetDepartmentId,
    reporterName: row.reporterName,
    technicianName: row.technicianName,
    approverName: row.approverName || null,
    departmentName: row.departmentName,
    attachments: row.attachments || [],
  };
}

export const maintenanceApi = {
  async getMaintenanceRequests(query: MaintenanceQuery = {}): Promise<PaginatedMaintenance> {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.assetId) params.set("assetId", query.assetId);
    if (query.reportedBy) params.set("reportedBy", query.reportedBy);
    if (query.technicianId) params.set("technicianId", query.technicianId);
    if (query.priority) params.set("priority", query.priority);
    if (query.status) params.set("status", query.status);
    if (query.departmentId) params.set("departmentId", query.departmentId);
    if (query.startDate) params.set("createdFrom", query.startDate);
    if (query.endDate) params.set("createdTo", query.endDate);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.sortOrder) params.set("sortOrder", query.sortOrder);

    const res = await apiRequest<{
      success: boolean;
      data: BackendMaintenanceRow[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/api/v1/maintenance?${params.toString()}`);

    let mappedData: MaintenanceRequest[] = [];
    if (res.success && Array.isArray(res.data)) {
      mappedData = res.data.map(mapBackendRow);
    }

    return {
      success: res.success,
      data: mappedData,
      meta: res.meta,
    };
  },

  async getMaintenanceRequestById(id: string): Promise<{ success: boolean; data: MaintenanceRequest }> {
    const res = await apiRequest<{ success: boolean; data: BackendMaintenanceRow }>(
      `/api/v1/maintenance/${id}`
    );

    return {
      success: res.success,
      data: mapBackendRow(res.data),
    };
  },

  async createMaintenanceRequest(data: CreateMaintenanceInput): Promise<{ success: boolean; data: MaintenanceRequest }> {
    const res = await apiRequest<{ success: boolean; data: BackendMaintenanceRow["request"] }>("/api/v1/maintenance", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      success: res.success,
      data: { ...res.data } as unknown as MaintenanceRequest,
    };
  },

  async approveRequest(id: string, data: ApproveRequestInput): Promise<{ success: boolean; data: MaintenanceRequest }> {
    const res = await apiRequest<{ success: boolean; data: BackendMaintenanceRow["request"] }>(`/api/v1/maintenance/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    return {
      success: res.success,
      data: { ...res.data } as unknown as MaintenanceRequest,
    };
  },

  async rejectRequest(id: string, data: RejectRequestInput): Promise<{ success: boolean; data: MaintenanceRequest }> {
    const res = await apiRequest<{ success: boolean; data: BackendMaintenanceRow["request"] }>(`/api/v1/maintenance/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    return {
      success: res.success,
      data: { ...res.data } as unknown as MaintenanceRequest,
    };
  },

  async assignTechnician(id: string, data: AssignTechnicianInput): Promise<{ success: boolean; data: MaintenanceRequest }> {
    const res = await apiRequest<{ success: boolean; data: BackendMaintenanceRow["request"] }>(`/api/v1/maintenance/${id}/assign-technician`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    return {
      success: res.success,
      data: { ...res.data } as unknown as MaintenanceRequest,
    };
  },

  async startMaintenance(id: string): Promise<{ success: boolean; data: MaintenanceRequest }> {
    const res = await apiRequest<{ success: boolean; data: BackendMaintenanceRow["request"] }>(`/api/v1/maintenance/${id}/start`, {
      method: "PATCH",
    });

    return {
      success: res.success,
      data: { ...res.data } as unknown as MaintenanceRequest,
    };
  },

  async resolveMaintenance(id: string, data: ResolveMaintenanceInput): Promise<{ success: boolean; data: MaintenanceRequest }> {
    const res = await apiRequest<{ success: boolean; data: BackendMaintenanceRow["request"] }>(`/api/v1/maintenance/${id}/resolve`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    return {
      success: res.success,
      data: { ...res.data } as unknown as MaintenanceRequest,
    };
  },

  async uploadAttachment(id: string, file: File): Promise<{ success: boolean; data: MaintenanceAttachment }> {
    const form = new FormData();
    form.append("file", file);

    return apiRequest<{ success: boolean; data: MaintenanceAttachment }>(`/api/v1/maintenance/${id}/attachments`, {
      method: "POST",
      body: form,
    });
  },

  async deleteAttachment(id: string, attachmentId: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/api/v1/maintenance/${id}/attachments/${attachmentId}`, {
      method: "DELETE",
    });
  },

  async getHistory(requestId: string): Promise<{ success: boolean; data: MaintenanceHistoryEntry[] }> {
    const reqRes = await this.getMaintenanceRequestById(requestId);
    if (!reqRes.success || !reqRes.data) {
      return { success: false, data: [] };
    }

    const assetId = reqRes.data.assetId;

    interface AssetHistoryRecord {
      id: string;
      action: string;
      description: string;
      performedBy: string;
      performedByName: string;
      metadata: {
        maintenanceRequestId?: string;
      } | null;
      timestamp: string;
    }

    const assetRes = await apiRequest<{ success: boolean; data: { history: AssetHistoryRecord[] } }>(
      `/api/v1/assets/${assetId}`
    );

    if (!assetRes.success || !assetRes.data || !Array.isArray(assetRes.data.history)) {
      return { success: true, data: [] };
    }

    // Filter timeline entries corresponding to this maintenance request id
    const filtered = assetRes.data.history
      .filter((h) => h.metadata?.maintenanceRequestId === requestId)
      .map((h) => ({
        id: h.id,
        assetId: assetId,
        action: h.action,
        description: h.description,
        performedBy: h.performedBy,
        performedByName: h.performedByName || "System",
        createdAt: h.timestamp,
      }));

    return {
      success: true,
      data: filtered,
    };
  },
};
