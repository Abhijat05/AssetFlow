import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../services/api";
import { orgApi } from "../../organization/services/api";
import { assetApi } from "../../assets/services/api";

export const DASHBOARD_KEY = ["dashboard", "full"];
export const DASHBOARD_KPIS_KEY = ["dashboard", "kpis"];
export const DASHBOARD_ACTIVITY_KEY = ["dashboard", "activity"];
export const DASHBOARD_RETURNS_KEY = ["dashboard", "returns"];
export const DASHBOARD_BOOKINGS_KEY = ["dashboard", "bookings"];
export const DASHBOARD_MAINTENANCE_KEY = ["dashboard", "maintenance"];
export const DASHBOARD_AUDITS_KEY = ["dashboard", "audits"];
export const DEPT_DISTRIBUTION_KEY = ["dashboard", "dept-distribution"];

export function useDashboardData() {
  return useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: () => dashboardApi.getFullDashboard().then((res) => res.data),
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useDashboardKpis() {
  return useQuery({
    queryKey: DASHBOARD_KPIS_KEY,
    queryFn: () => dashboardApi.getKpis().then((res) => res.data),
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: DASHBOARD_ACTIVITY_KEY,
    queryFn: () => dashboardApi.getActivity().then((res) => res.data),
  });
}

export function useDashboardReturns() {
  return useQuery({
    queryKey: DASHBOARD_RETURNS_KEY,
    queryFn: () => dashboardApi.getReturns().then((res) => res.data),
  });
}

export function useDashboardBookings() {
  return useQuery({
    queryKey: DASHBOARD_BOOKINGS_KEY,
    queryFn: () => dashboardApi.getBookings().then((res) => res.data),
  });
}

export function useDashboardMaintenance() {
  return useQuery({
    queryKey: DASHBOARD_MAINTENANCE_KEY,
    queryFn: () => dashboardApi.getMaintenance().then((res) => res.data),
  });
}

export function useDashboardAudits() {
  return useQuery({
    queryKey: DASHBOARD_AUDITS_KEY,
    queryFn: () => dashboardApi.getAudits().then((res) => res.data),
  });
}

// Custom hook to aggregate asset counts by department for charts
export function useDepartmentAssetDistribution(enabled: boolean) {
  return useQuery({
    queryKey: DEPT_DISTRIBUTION_KEY,
    queryFn: async () => {
      const [departmentsRes, assetsRes] = await Promise.all([
        orgApi.getDepartments(),
        assetApi.getAssets({ limit: 100 }), // Request up to 100 assets to aggregate
      ]);

      const departments = departmentsRes.data || [];
      const assets = assetsRes.data || [];

      // Compute distribution
      const distribution = departments.map((dept) => {
        const count = assets.filter((a) => a.departmentId === dept.id).length;
        return {
          name: dept.name,
          assetsCount: count,
        };
      });

      // Include assets with no department assigned (if any)
      const unassignedCount = assets.filter((a) => !a.departmentId).length;
      if (unassignedCount > 0) {
        distribution.push({
          name: "Unassigned",
          assetsCount: unassignedCount,
        });
      }

      return distribution.filter((item) => item.assetsCount > 0);
    },
    enabled,
  });
}
