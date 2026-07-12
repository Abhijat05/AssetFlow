import type {
  ReportFilters,
  UtilizationReportData,
  MaintenanceReportData,
  LifecycleReportData,
  DepartmentReportData,
  BookingReportData,
  AuditReportData,
  ExportFormat,
  ReportType,
} from "../types";

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  Object.assign(headers, options.headers || {});

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const text = await response.text();
    let message = `Request failed with status ${response.status}`;
    try {
      const json = JSON.parse(text);
      message = json.error || json.message || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function buildQueryString(filters: ReportFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  const str = params.toString();
  return str ? `?${str}` : "";
}

export const reportsApi = {
  async getUtilization(filters: ReportFilters): Promise<{ success: boolean; data: UtilizationReportData }> {
    return apiRequest<{ success: boolean; data: UtilizationReportData }>(
      `/api/v1/reports/utilization${buildQueryString(filters)}`
    );
  },

  async getMaintenance(filters: ReportFilters): Promise<{ success: boolean; data: MaintenanceReportData }> {
    return apiRequest<{ success: boolean; data: MaintenanceReportData }>(
      `/api/v1/reports/maintenance${buildQueryString(filters)}`
    );
  },

  async getLifecycle(filters: ReportFilters): Promise<{ success: boolean; data: LifecycleReportData }> {
    return apiRequest<{ success: boolean; data: LifecycleReportData }>(
      `/api/v1/reports/lifecycle${buildQueryString(filters)}`
    );
  },

  async getDepartments(filters: ReportFilters): Promise<{ success: boolean; data: DepartmentReportData }> {
    return apiRequest<{ success: boolean; data: DepartmentReportData }>(
      `/api/v1/reports/departments${buildQueryString(filters)}`
    );
  },

  async getBookings(filters: ReportFilters): Promise<{ success: boolean; data: BookingReportData }> {
    return apiRequest<{ success: boolean; data: BookingReportData }>(
      `/api/v1/reports/bookings${buildQueryString(filters)}`
    );
  },

  async getAudits(filters: ReportFilters): Promise<{ success: boolean; data: AuditReportData }> {
    return apiRequest<{ success: boolean; data: AuditReportData }>(
      `/api/v1/reports/audits${buildQueryString(filters)}`
    );
  },

  getExportUrl(report: ReportType, format: ExportFormat, filters: ReportFilters): string {
    const params = new URLSearchParams();
    params.append("report", report);
    params.append("format", format);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    return `/api/v1/reports/export?${params.toString()}`;
  },
};
export default reportsApi;
