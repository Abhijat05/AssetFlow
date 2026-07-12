import type { Asset, AssetHistoryEntry, AssetQuery, PaginatedAssets, RegisterAssetInput } from "../types";

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  Object.assign(headers, options.headers || {});

  const response = await fetch(url, { ...options, headers });
  const text = await response.text();
  let json = {} as T & { error?: string; message?: string };
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // ignore
  }

  if (!response.ok) {
    throw new Error(json.error || json.message || `Request failed with status ${response.status}`);
  }
  return json;
}

export const assetApi = {
  async getAssets(query: AssetQuery = {}): Promise<PaginatedAssets> {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.categoryId) params.set("categoryId", query.categoryId);
    if (query.departmentId) params.set("departmentId", query.departmentId);
    if (query.status) params.set("status", query.status);
    if (query.condition) params.set("condition", query.condition);
    if (query.isBookable !== undefined) params.set("isBookable", String(query.isBookable));
    if (query.currentLocation) params.set("currentLocation", query.currentLocation);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.sortOrder) params.set("sortOrder", query.sortOrder);
    return apiRequest<PaginatedAssets>(`/api/v1/assets?${params.toString()}`);
  },

  async getAssetById(id: string): Promise<{ success: boolean; data: Asset }> {
    return apiRequest<{ success: boolean; data: Asset }>(`/api/v1/assets/${id}`);
  },

  async registerAsset(data: RegisterAssetInput): Promise<{ success: boolean; data: Asset }> {
    return apiRequest<{ success: boolean; data: Asset }>("/api/v1/assets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateAsset(id: string, data: Partial<RegisterAssetInput>): Promise<{ success: boolean; data: Asset }> {
    return apiRequest<{ success: boolean; data: Asset }>(`/api/v1/assets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async uploadAssetPhoto(assetId: string, file: File): Promise<{ success: boolean; data: { photoUrl: string } }> {
    const form = new FormData();
    form.append("photo", file);
    return apiRequest<{ success: boolean; data: { photoUrl: string } }>(`/api/v1/assets/${assetId}/photo`, {
      method: "POST",
      body: form,
    });
  },

  async uploadDocuments(assetId: string, files: File[]): Promise<{ success: boolean; data: Asset }> {
    const form = new FormData();
    files.forEach((f) => form.append("documents", f));
    return apiRequest<{ success: boolean; data: Asset }>(`/api/v1/assets/${assetId}/documents`, {
      method: "POST",
      body: form,
    });
  },

  async getAssetHistory(assetId: string): Promise<{ success: boolean; data: AssetHistoryEntry[] }> {
    return apiRequest<{ success: boolean; data: AssetHistoryEntry[] }>(`/api/v1/assets/${assetId}/history`);
  },
};
