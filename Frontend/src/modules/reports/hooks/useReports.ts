import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../services/api";
import type { ReportFilters } from "../types";

export const REPORTS_KEYS = {
  utilization: (filters: ReportFilters) => ["reports", "utilization", filters],
  maintenance: (filters: ReportFilters) => ["reports", "maintenance", filters],
  lifecycle: (filters: ReportFilters) => ["reports", "lifecycle", filters],
  departments: (filters: ReportFilters) => ["reports", "departments", filters],
  bookings: (filters: ReportFilters) => ["reports", "bookings", filters],
  audits: (filters: ReportFilters) => ["reports", "audits", filters],
};

export function useUtilizationReport(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: REPORTS_KEYS.utilization(filters),
    queryFn: () => reportsApi.getUtilization(filters).then((res) => res.data),
    enabled,
  });
}

export function useMaintenanceReport(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: REPORTS_KEYS.maintenance(filters),
    queryFn: () => reportsApi.getMaintenance(filters).then((res) => res.data),
    enabled,
  });
}

export function useLifecycleReport(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: REPORTS_KEYS.lifecycle(filters),
    queryFn: () => reportsApi.getLifecycle(filters).then((res) => res.data),
    enabled,
  });
}

export function useDepartmentReport(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: REPORTS_KEYS.departments(filters),
    queryFn: () => reportsApi.getDepartments(filters).then((res) => res.data),
    enabled,
  });
}

export function useBookingReport(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: REPORTS_KEYS.bookings(filters),
    queryFn: () => reportsApi.getBookings(filters).then((res) => res.data),
    enabled,
  });
}

export function useAuditReport(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: REPORTS_KEYS.audits(filters),
    queryFn: () => reportsApi.getAudits(filters).then((res) => res.data),
    enabled,
  });
}
