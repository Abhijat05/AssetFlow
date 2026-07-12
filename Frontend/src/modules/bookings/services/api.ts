import type {
  Booking,
  BookingQuery,
  PaginatedBookings,
  CreateBookingInput,
  UpdateBookingInput,
  BookingHistoryEntry,
  CalendarBooking,
} from "../types";

interface BackendBookingRow {
  booking: {
    id: string;
    assetId: string;
    bookedBy: string;
    departmentId: string;
    title: string;
    purpose: string | null;
    startTime: string;
    endTime: string;
    status: Booking["status"];
    cancelReason: string | null;
    createdAt: string;
    updatedAt: string;
  };
  assetName: string | null;
  assetTag: string | null;
  bookerName: string | null;
  bookerEmail: string | null;
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
    // Ignore JSON parsing errors
  }

  if (!response.ok) {
    throw new Error(json.error || json.message || `Request failed with status ${response.status}`);
  }

  return json as T;
}

export const bookingApi = {
  async getBookings(query: BookingQuery = {}): Promise<PaginatedBookings> {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.resourceId) params.set("assetId", query.resourceId);
    if (query.bookedBy) params.set("bookedBy", query.bookedBy);
    if (query.departmentId) params.set("departmentId", query.departmentId);
    if (query.status) params.set("status", query.status);
    if (query.startDate) params.set("startFrom", query.startDate);
    if (query.endDate) params.set("startTo", query.endDate);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.sortOrder) params.set("sortOrder", query.sortOrder);

    const res = await apiRequest<{
      success: boolean;
      data: BackendBookingRow[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/api/v1/bookings?${params.toString()}`);

    let mappedData: Booking[] = [];
    if (res.success && Array.isArray(res.data)) {
      mappedData = res.data.map((row) => {
        const b = row.booking || {};
        return {
          ...b,
          resource: {
            id: b.assetId,
            name: row.assetName || "—",
            assetTag: row.assetTag || "—",
            photoUrl: null,
          },
          user: {
            id: b.bookedBy,
            name: row.bookerName || "Shared Booker",
            email: row.bookerEmail || "",
          },
          department: b.departmentId ? {
            id: b.departmentId,
            name: row.departmentName || "—",
          } : null,
        } as Booking;
      });
    }

    return {
      success: res.success,
      data: mappedData,
      meta: res.meta,
    } as PaginatedBookings;
  },

  async getBookingById(id: string): Promise<{ success: boolean; data: Booking }> {
    const res = await apiRequest<{ success: boolean; data: BackendBookingRow["booking"] }>(
      `/api/v1/bookings/${id}`
    );

    if (res.success && res.data) {
      const b = res.data;

      // Parallel fetching of related data
      const [assetRes, empRes, deptRes] = await Promise.allSettled([
        b.assetId ? fetch(`/api/v1/assets/${b.assetId}`).then((r) => r.json()) : Promise.resolve(null),
        b.bookedBy ? fetch("/api/v1/organization/employees?limit=100").then((r) => r.json()) : Promise.resolve(null),
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

      const emp = b.bookedBy
        ? (Array.isArray(employees)
            ? employees.find((e: SimplifiedEmployee) => e.id === b.bookedBy)
            : null)
        : null;
      const dept = b.departmentId
        ? (Array.isArray(departments)
            ? departments.find((d: SimplifiedDepartment) => d.id === b.departmentId)
            : null)
        : null;

      return {
        success: true,
        data: {
          ...b,
          resource: {
            id: b.assetId,
            name: assetData?.name || "—",
            assetTag: assetData?.assetTag || "—",
            photoUrl: assetData?.photoUrl || null,
          },
          user: {
            id: b.bookedBy,
            name: emp?.name || "Shared Booker",
            email: emp?.email || "",
          },
          department: b.departmentId ? {
            id: b.departmentId,
            name: dept?.name || "—",
          } : null,
        } as Booking,
      };
    }

    return res as unknown as { success: boolean; data: Booking };
  },

  async createBooking(data: CreateBookingInput): Promise<{ success: boolean; data: Booking }> {
    return apiRequest<{ success: boolean; data: Booking }>("/api/v1/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateBooking(id: string, data: UpdateBookingInput): Promise<{ success: boolean; data: Booking }> {
    return apiRequest<{ success: boolean; data: Booking }>(`/api/v1/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async cancelBooking(id: string, reason: string): Promise<{ success: boolean; data: Booking }> {
    return apiRequest<{ success: boolean; data: Booking }>(`/api/v1/bookings/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ cancelReason: reason }),
    });
  },

  async getCalendarBookings(
    assetId: string,
    from?: string,
    to?: string
  ): Promise<{ success: boolean; data: CalendarBooking[] }> {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    return apiRequest<{ success: boolean; data: CalendarBooking[] }>(
      `/api/v1/bookings/calendar/${assetId}?${params.toString()}`
    );
  },

  async getHistory(bookingId: string): Promise<{ success: boolean; data: BookingHistoryEntry[] }> {
    const bRes = await this.getBookingById(bookingId);
    if (!bRes.success || !bRes.data) {
      return { success: false, data: [] };
    }

    const assetId = bRes.data.resource.id;

    interface AssetHistoryRecord {
      id: string;
      action: string;
      description: string;
      performedBy: string;
      performedByName: string;
      metadata: {
        bookingId?: string;
      } | null;
      timestamp: string;
    }

    const assetRes = await apiRequest<{ success: boolean; data: { history: AssetHistoryRecord[] } }>(
      `/api/v1/assets/${assetId}`
    );

    if (!assetRes.success || !assetRes.data || !Array.isArray(assetRes.data.history)) {
      return { success: true, data: [] };
    }

    // Filter timeline entries corresponding to this booking id
    const filtered = assetRes.data.history
      .filter((h) => h.metadata?.bookingId === bookingId)
      .map((h) => ({
        id: h.id,
        bookingId: bookingId,
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
