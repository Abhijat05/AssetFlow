import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { useDashboardData, useDepartmentAssetDistribution } from "../hooks/useDashboard";
import { KpiCards } from "../components/KpiCards";
import { QuickActions } from "../components/QuickActions";
import { RecentActivity } from "../components/RecentActivity";
import { ReturnsList } from "../components/ReturnsList";
import { PendingItems } from "../components/PendingItems";
import { cn } from "../../../lib/utils";

// Charts
import { AssetStatusDistribution } from "../charts/AssetStatusDistribution";
import { MaintenanceStatus } from "../charts/MaintenanceStatus";
import { BookingStatus } from "../charts/BookingStatus";
import { AuditProgress } from "../charts/AuditProgress";
import { DepartmentAssetDistribution } from "../charts/DepartmentAssetDistribution";

import { CalendarDays, RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/button";

export const DashboardPage: React.FC = () => {
  const { user, role } = useAuth();
  const currentRole = role || "EMPLOYEE";

  // Fetch full dashboard data
  const { data: dashboardData, isLoading, isError, error, refetch, isRefetching } = useDashboardData();

  // Fetch department distribution (Only for ADMIN and ASSET_MANAGER)
  const showDeptDistribution = currentRole === "ADMIN" || currentRole === "ASSET_MANAGER";
  const { data: deptDistribution, isLoading: isDeptLoading } = useDepartmentAssetDistribution(showDeptDistribution);

  const formatDate = () => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="px-6 py-8 space-y-8 max-w-7xl mx-auto">
          {/* Welcome Banner Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-40 rounded bg-slate-200" />
            <Skeleton className="h-8 w-80 rounded-lg bg-slate-200" />
            <Skeleton className="h-4 w-96 rounded bg-slate-200" />
          </div>

          {/* KPI Cards Skeletons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-slate-200 bg-white">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-24 rounded bg-slate-100" />
                    <Skeleton className="h-8 w-8 rounded-xl bg-slate-100" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-12 rounded bg-slate-100" />
                    <Skeleton className="h-3 w-32 rounded bg-slate-100" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-slate-200 bg-white">
                <CardHeader className="p-5 border-b border-slate-100">
                  <Skeleton className="h-4 w-40 rounded bg-slate-100" />
                </CardHeader>
                <CardContent className="p-5">
                  <Skeleton className="h-[200px] w-full rounded bg-slate-100" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell>
        <div className="px-6 py-8 max-w-xl mx-auto mt-20 text-center space-y-4">
          <div className="h-16 w-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-[#050038]">Failed to Load Dashboard</h2>
          <p className="text-sm text-slate-500 leading-normal">
            {error instanceof Error ? error.message : "An error occurred while fetching dashboard statistics."}
          </p>
          <Button
            onClick={() => refetch()}
            className="rounded-xl px-5 bg-[#4262ff] hover:bg-[#4262ff]/90 text-white font-bold"
          >
            Try Again
          </Button>
        </div>
      </AppShell>
    );
  }

  const data = dashboardData!;
  const kpis = data.kpis;

  return (
    <AppShell>
      <div className="px-6 py-8 space-y-8 max-w-7xl mx-auto">
        {/* Welcome / Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{formatDate()}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#050038] tracking-tight">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-xs text-slate-500">
              Operational overview for{" "}
              <span className="font-extrabold text-[#4262ff] capitalize">
                {currentRole.toLowerCase().replace(/_/g, " ")}
              </span>
              .
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 gap-1.5 h-9"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefetching && "animate-spin")} />
              {isRefetching ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key Performance Indicators</h2>
          <KpiCards kpis={kpis} role={currentRole} />
        </div>

        {/* Quick Actions */}
        {currentRole !== "EMPLOYEE" && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick Actions</h2>
            <QuickActions actions={data.quickActions} />
          </div>
        )}

        {/* Charts Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analytics & Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Distribution (Inapplicable to Employee) */}
            {currentRole !== "EMPLOYEE" && (
              <Card className="rounded-2xl border border-slate-200 bg-white hover:shadow-sm transition-all">
                <CardHeader className="p-5 border-b border-slate-100 flex-shrink-0">
                  <CardTitle className="text-sm font-bold text-[#050038]">Asset Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <AssetStatusDistribution kpis={kpis} />
                </CardContent>
              </Card>
            )}

            {/* Department Distribution (ADMIN / ASSET_MANAGER only) */}
            {showDeptDistribution && (
              <Card className="rounded-2xl border border-slate-200 bg-white hover:shadow-sm transition-all">
                <CardHeader className="p-5 border-b border-slate-100 flex-shrink-0">
                  <CardTitle className="text-sm font-bold text-[#050038]">Department Asset Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <DepartmentAssetDistribution data={deptDistribution} isLoading={isDeptLoading} />
                </CardContent>
              </Card>
            )}

            {/* Maintenance Status (All roles) */}
            <Card className="rounded-2xl border border-slate-200 bg-white hover:shadow-sm transition-all">
              <CardHeader className="p-5 border-b border-slate-100 flex-shrink-0">
                <CardTitle className="text-sm font-bold text-[#050038]">Maintenance Requests Status</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <MaintenanceStatus stats={data.maintenance} />
              </CardContent>
            </Card>

            {/* Booking Status (All roles) */}
            <Card className="rounded-2xl border border-slate-200 bg-white hover:shadow-sm transition-all">
              <CardHeader className="p-5 border-b border-slate-100 flex-shrink-0">
                <CardTitle className="text-sm font-bold text-[#050038]">Booking Status Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <BookingStatus bookings={data.bookings} />
              </CardContent>
            </Card>

            {/* Audit Progress (Inapplicable to Employee) */}
            {currentRole !== "EMPLOYEE" && (
              <Card className="rounded-2xl border border-slate-200 bg-white hover:shadow-sm transition-all">
                <CardHeader className="p-5 border-b border-slate-100 flex-shrink-0">
                  <CardTitle className="text-sm font-bold text-[#050038]">Audit Progress & Compliance</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <AuditProgress stats={data.audits} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom Section: Activities, Returns, Pending Items */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">Operational Feeds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {/* Timeline */}
            <div className="h-[380px] overflow-hidden">
              <RecentActivity activity={data.activity} />
            </div>

            {/* Returns monitor */}
            <div className="h-[380px] overflow-hidden">
              <ReturnsList overdue={data.returns.overdue} upcoming={data.returns.upcoming} />
            </div>

            {/* Pending actions */}
            <div className="h-[380px] overflow-hidden">
              <PendingItems kpis={kpis} role={currentRole} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
export default DashboardPage;
