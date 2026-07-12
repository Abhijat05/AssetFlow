import type {
  Allocation,
  AllocationQuery,
  PaginatedAllocations,
  AllocateAssetInput,
  TransferRequest,
  AllocationHistoryEntry,
} from "../types";

interface BackendAllocationRow {
  allocation: {
    id: string;
    assetId: string;
    employeeId: string | null;
    departmentId: string | null;
    allocatedAt: string;
    expectedReturnDate: string | null;
    returnedAt: string | null;
    status: Allocation["status"];
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  };
  assetTag: string | null;
  assetName: string | null;
  employeeName: string | null;
  employeeEmail: string | null;
  departmentName: string | null;
}

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
    // Ignore JSON parsing errors for empty text or non-json responses
  }

  if (!response.ok) {
    throw new Error(json.error || json.message || `Request failed with status ${response.status}`);
  }

  return json as T;
}

export const allocationApi = {
  async getAllocations(query: AllocationQuery = {}, isMy = false): Promise<PaginatedAllocations> {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.status) params.set("status", query.status);
    if (query.departmentId) params.set("departmentId", query.departmentId);
    if (query.employeeId) params.set("employeeId", query.employeeId);
    if (query.expectedReturnDateFrom) params.set("expectedReturnDateFrom", query.expectedReturnDateFrom);
    if (query.expectedReturnDateTo) params.set("expectedReturnDateTo", query.expectedReturnDateTo);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.sortOrder) params.set("sortOrder", query.sortOrder);

    const basePath = isMy ? "/api/v1/allocations/my" : "/api/v1/allocations";
    const res = await apiRequest<{
      success: boolean;
      data: BackendAllocationRow[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`${basePath}?${params.toString()}`);

    // Map backend flat rows into the nested structure expected by the frontend
    let mappedData: Allocation[] = [];
    if (res.success && Array.isArray(res.data)) {
      mappedData = res.data.map((row) => {
        const alloc = row.allocation || {};
        return {
          ...alloc,
          asset: {
            id: alloc.assetId,
            name: row.assetName || "—",
            assetTag: row.assetTag || "—",
          },
          employee: alloc.employeeId ? {
            id: alloc.employeeId,
            name: row.employeeName || "Shared Resource",
            email: row.employeeEmail || "",
          } : null,
          department: alloc.departmentId ? {
            id: alloc.departmentId,
            name: row.departmentName || "—",
          } : null,
        } as Allocation;
      });
    }

    return {
      success: res.success,
      data: mappedData,
      meta: res.meta,
    } as PaginatedAllocations;
  },

  async getAllocationById(id: string): Promise<{ success: boolean; data: Allocation }> {
    const res = await apiRequest<{ success: boolean; data: BackendAllocationRow["allocation"] }>(
      `/api/v1/allocations/${id}`
    );
    
    if (res.success && res.data) {
      const alloc = res.data;

      // Dynamically resolve foreign details in parallel using try-catch blocks to prevent breaking
      const [assetRes, empRes, deptRes] = await Promise.allSettled([
        alloc.assetId ? fetch(`/api/v1/assets/${alloc.assetId}`).then((r) => r.json()) : Promise.resolve(null),
        alloc.employeeId ? fetch("/api/v1/organization/employees?limit=100").then((r) => r.json()) : Promise.resolve(null),
        fetch("/api/v1/organization/departments").then((r) => r.json()),
      ]);

      const assetData = assetRes.status === "fulfilled" && assetRes.value?.success ? assetRes.value.data : null;
      const employees = empRes.status === "fulfilled" && empRes.value?.success ? empRes.value.data : [];
      const departments = deptRes.status === "fulfilled" && deptRes.value ? deptRes.value : [];

      interface SimplifiedEmployee {
        id: string;
        name: string;
        email: string;
      }

      interface SimplifiedDepartment {
        id: string;
        name: string;
      }

      const emp = alloc.employeeId
        ? (Array.isArray(employees)
            ? employees.find((e: SimplifiedEmployee) => e.id === alloc.employeeId)
            : null)
        : null;
      const dept = alloc.departmentId
        ? (Array.isArray(departments)
            ? departments.find((d: SimplifiedDepartment) => d.id === alloc.departmentId)
            : null)
        : null;

      return {
        success: true,
        data: {
          ...alloc,
          asset: {
            id: alloc.assetId,
            name: assetData?.name || "—",
            assetTag: assetData?.assetTag || "—",
          },
          employee: alloc.employeeId ? {
            id: alloc.employeeId,
            name: emp?.name || "Shared Resource",
            email: emp?.email || "",
          } : null,
          department: alloc.departmentId ? {
            id: alloc.departmentId,
            name: dept?.name || "—",
          } : null,
        } as Allocation,
      };
    }

    return res as unknown as { success: boolean; data: Allocation };
  },

  async allocateAsset(data: AllocateAssetInput): Promise<{ success: boolean; data: Allocation }> {
    return apiRequest<{ success: boolean; data: Allocation }>("/api/v1/allocations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async requestTransfer(
    data: { assetId: string; requestedEmployeeId: string; requestedDepartmentId?: string | null; reason: string }
  ): Promise<{ success: boolean; data: TransferRequest }> {
    return apiRequest<{ success: boolean; data: TransferRequest }>("/api/v1/allocations/transfers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async approveTransfer(transferRequestId: string): Promise<{ success: boolean; data: Allocation }> {
    return apiRequest<{ success: boolean; data: Allocation }>(`/api/v1/allocations/transfers/${transferRequestId}/approve`, {
      method: "POST",
    });
  },

  async rejectTransfer(transferRequestId: string, reason?: string | null): Promise<{ success: boolean; data: TransferRequest }> {
    return apiRequest<{ success: boolean; data: TransferRequest }>(`/api/v1/allocations/transfers/${transferRequestId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async requestReturn(allocationId: string): Promise<{ success: boolean; data: Allocation }> {
    return apiRequest<{ success: boolean; data: Allocation }>(`/api/v1/allocations/${allocationId}/return-request`, {
      method: "POST",
    });
  },

  async approveReturn(
    allocationId: string,
    data: { returnCondition: string; returnNotes?: string | null }
  ): Promise<{ success: boolean; data: Allocation }> {
    return apiRequest<{ success: boolean; data: Allocation }>(`/api/v1/allocations/${allocationId}/approve-return`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getTransferRequests(allocationId: string): Promise<{ success: boolean; data: TransferRequest[] }> {
    const res = await apiRequest<{ success: boolean; data: TransferRequest[] }>("/api/v1/allocations/transfers");
    if (res.success && res.data) {
      return {
        success: true,
        data: res.data.filter((t) => t.allocationId === allocationId),
      };
    }
    return res;
  },

  async getHistory(allocationId: string): Promise<{ success: boolean; data: AllocationHistoryEntry[] }> {
    // 1. Load the allocation first to obtain assetId
    const allocRes = await apiRequest<{ success: boolean; data: Allocation }>(`/api/v1/allocations/${allocationId}`);
    if (!allocRes.success || !allocRes.data) {
      return { success: false, data: [] };
    }

    const assetId = allocRes.data.assetId;

    // 2. Fetch the corresponding asset detail containing its history timeline
    interface AssetHistoryItem {
      id: string;
      action: string;
      description: string;
      performedBy: string;
      performedByName?: string | null;
      timestamp: string;
    }

    const assetRes = await apiRequest<{ success: boolean; data: { history: AssetHistoryItem[] } }>(
      `/api/v1/assets/${assetId}`
    );

    if (!assetRes.success || !assetRes.data || !Array.isArray(assetRes.data.history)) {
      return { success: true, data: [] };
    }

    // 3. Map asset history records into the allocation history model
    const mappedHistory: AllocationHistoryEntry[] = assetRes.data.history.map((h) => ({
      id: h.id,
      allocationId: allocationId,
      action: h.action,
      description: h.description,
      performedBy: h.performedBy,
      performedByName: h.performedByName || "System",
      createdAt: h.timestamp,
    }));

    return {
      success: true,
      data: mappedHistory,
    };
  },
};
