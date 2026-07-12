import type { DashboardData, KpiData, DashboardActivity, OverdueReturnItem, UpcomingReturnItem, DashboardBookingItem, DashboardMaintenanceStats, DashboardAuditStats } from "../types";

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
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

export const dashboardApi = {
  async getFullDashboard(): Promise<{ success: boolean; data: DashboardData }> {
    return apiRequest<{ success: boolean; data: DashboardData }>("/api/v1/dashboard");
  },

  async getKpis(): Promise<{ success: boolean; data: KpiData }> {
    return apiRequest<{ success: boolean; data: KpiData }>("/api/v1/dashboard/kpis");
  },

  async getActivity(): Promise<{ success: boolean; data: DashboardActivity[] }> {
    return apiRequest<{ success: boolean; data: DashboardActivity[] }>("/api/v1/dashboard/activity");
  },

  async getReturns(): Promise<{ success: boolean; data: { overdue: OverdueReturnItem[]; upcoming: UpcomingReturnItem[] } }> {
    return apiRequest<{ success: boolean; data: { overdue: OverdueReturnItem[]; upcoming: UpcomingReturnItem[] } }>("/api/v1/dashboard/returns");
  },

  async getBookings(): Promise<{ success: boolean; data: { today: DashboardBookingItem[]; ongoing: DashboardBookingItem[]; upcoming: DashboardBookingItem[] } }> {
    return apiRequest<{ success: boolean; data: { today: DashboardBookingItem[]; ongoing: DashboardBookingItem[]; upcoming: DashboardBookingItem[] } }>("/api/v1/dashboard/bookings");
  },

  async getMaintenance(): Promise<{ success: boolean; data: DashboardMaintenanceStats }> {
    return apiRequest<{ success: boolean; data: DashboardMaintenanceStats }>("/api/v1/dashboard/maintenance");
  },

  async getAudits(): Promise<{ success: boolean; data: DashboardAuditStats }> {
    return apiRequest<{ success: boolean; data: DashboardAuditStats }>("/api/v1/dashboard/audits");
  },
};
