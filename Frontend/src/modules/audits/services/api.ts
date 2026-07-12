import type {
  AuditCycle,
  AuditQuery,
  PaginatedAudits,
  CreateAuditInput,
  UpdateAuditInput,
  VerifyAssetInput,
  DiscrepancyReport,
  AuditAssignment,
  AuditRecord,
} from "../types";

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

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

export const auditApi = {
  async getAudits(query: AuditQuery = {}): Promise<PaginatedAudits> {
    const params = new URLSearchParams();
    if (query.name) params.set("name", query.name);
    if (query.departmentId) params.set("departmentId", query.departmentId);
    if (query.location) params.set("location", query.location);
    if (query.status) params.set("status", query.status);
    if (query.auditorId) params.set("auditorId", query.auditorId);
    if (query.startDate) params.set("startDateFrom", query.startDate);
    if (query.endDate) params.set("startDateTo", query.endDate);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.sortOrder) params.set("sortOrder", query.sortOrder);

    return apiRequest<PaginatedAudits>(`/api/v1/audits?${params.toString()}`);
  },

  async getAuditById(id: string): Promise<{ success: boolean; data: AuditCycle }> {
    const res = await apiRequest<{
      success: boolean;
      data: {
        cycle: AuditCycle;
        creatorName?: string;
        closerName?: string;
        departmentName?: string | null;
        auditors: AuditAssignment[];
        stats: AuditCycle["stats"];
        records: {
          record: AuditRecord;
          assetTag: string;
          assetName: string;
          assetStatus: string;
          assetLocation: string | null;
          departmentName: string | null;
          verifierName: string | null;
        }[];
      };
    }>(`/api/v1/audits/${id}`);

    const d = res.data;
    const cycle: AuditCycle = {
      ...d.cycle,
      creatorName: d.creatorName,
      closerName: d.closerName,
      departmentName: d.departmentName,
      auditors: d.auditors,
      stats: d.stats,
      records: d.records,
    };

    return {
      success: res.success,
      data: cycle,
    };
  },

  async createAuditCycle(data: Omit<CreateAuditInput, "auditorIds">): Promise<{ success: boolean; data: AuditCycle }> {
    const res = await apiRequest<{ success: boolean; data: AuditCycle }>("/api/v1/audits", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res;
  },

  async assignAuditors(id: string, auditorIds: string[]): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/api/v1/audits/${id}/auditors`, {
      method: "POST",
      body: JSON.stringify({ auditorIds }),
    });
  },

  async updateAuditCycle(id: string, data: UpdateAuditInput): Promise<{ success: boolean; data: AuditCycle }> {
    return apiRequest<{ success: boolean; data: AuditCycle }>(`/api/v1/audits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async verifyAsset(id: string, assetId: string, data: VerifyAssetInput): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/api/v1/audits/${id}/verify/${assetId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getDiscrepancyReport(id: string): Promise<{ success: boolean; data: DiscrepancyReport }> {
    return apiRequest<{ success: boolean; data: DiscrepancyReport }>(`/api/v1/audits/${id}/discrepancy-report`);
  },

  async closeAudit(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/api/v1/audits/${id}/close`, {
      method: "POST",
    });
  },
};
