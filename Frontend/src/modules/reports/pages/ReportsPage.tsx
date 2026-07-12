import React, { useState, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { toast } from "sonner";
import {
  FileDown,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Wrench,
  Activity,
  Building2,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";

import { reportsApi } from "../services/api";
import {
  useUtilizationReport,
  useMaintenanceReport,
  useLifecycleReport,
  useDepartmentReport,
  useBookingReport,
  useAuditReport,
} from "../hooks/useReports";

// Fetch lists for filters
import { orgApi } from "../../organization/services/api";
import { assetApi } from "../../assets/services/api";
import { useQuery } from "@tanstack/react-query";

// Components & Charts
import { ReportFilters } from "../components/ReportFilters";
import { ReportDataTable } from "../components/ReportDataTable";
import type { ColumnDefinition } from "../components/ReportDataTable";
import { UtilizationSummaryChart } from "../charts/UtilizationSummaryChart";
import { AssetUtilizationBarChart } from "../charts/AssetUtilizationBarChart";
import { MaintenanceStatusChart } from "../charts/MaintenanceStatusChart";
import { AssetLifecycleStatusChart } from "../charts/AssetLifecycleStatusChart";
import { DepartmentSummaryChart } from "../charts/DepartmentSummaryChart";
import { BookingOverTimeChart, BookingHeatmapChart } from "../charts/BookingAnalyticsCharts";
import { AuditSummaryChart, AuditDiscrepanciesChart } from "../charts/AuditAnalyticsCharts";

import type { ReportFilters as FiltersType, ReportType } from "../types";

export const ReportsPage: React.FC = () => {
  const { user, role } = useAuth();
  const userRole = role || "EMPLOYEE";

  // ── 1. Load Dropdowns for Filters ──────────────────────────────────────────
  const { data: deptsRes } = useQuery({
    queryKey: ["reports-filter-departments"],
    queryFn: () => orgApi.getDepartments(),
  });

  const { data: catsRes } = useQuery({
    queryKey: ["reports-filter-categories"],
    queryFn: () => orgApi.getCategories(),
  });

  const { data: assetsRes } = useQuery({
    queryKey: ["reports-filter-assets"],
    queryFn: () => assetApi.getAssets({ limit: 200 }),
  });

  const { data: empsRes } = useQuery({
    queryKey: ["reports-filter-employees"],
    queryFn: () => orgApi.getEmployees({ limit: 500 }),
  });

  const departments = useMemo(() => deptsRes?.data || [], [deptsRes]);
  const categories = useMemo(() => catsRes?.data || [], [catsRes]);
  const assetsList = useMemo(() => assetsRes?.data || [], [assetsRes]);
  const employees = useMemo(() => empsRes?.data || [], [empsRes]);

  // Extract unique locations from assets
  const locations = useMemo(() => {
    const unique = new Set<string>();
    assetsList.forEach((a) => {
      if (a.currentLocation) unique.add(a.currentLocation);
    });
    return Array.from(unique).sort();
  }, [assetsList]);

  // Detect Department Head's department
  const userDeptId = useMemo(() => {
    if (userRole !== "DEPARTMENT_HEAD" || !user?.id) return null;
    const dept = departments.find((d) => d.departmentHeadId === user.id);
    return dept ? dept.id : null;
  }, [userRole, user, departments]);

  // ── 2. Manage Active Tab & Filter State ─────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ReportType>("utilization");
  const [filters, setFilters] = useState<FiltersType>(() => {
    return {
      departmentId: userRole === "DEPARTMENT_HEAD" ? (userDeptId || undefined) : undefined,
    };
  });

  // Sync departmentId if departments list loads later for Dept Head
  React.useEffect(() => {
    if (userRole === "DEPARTMENT_HEAD" && userDeptId && !filters.departmentId) {
      setFilters((prev) => ({ ...prev, departmentId: userDeptId }));
    }
  }, [userRole, userDeptId, filters.departmentId]);

  // ── 3. Query Report Data (Only when tab is active) ──────────────────────────
  const { data: utilizationData, isLoading: loadingUtil } = useUtilizationReport(
    filters,
    activeTab === "utilization"
  );
  const { data: maintenanceData, isLoading: loadingMaint } = useMaintenanceReport(
    filters,
    activeTab === "maintenance"
  );
  const { data: lifecycleData, isLoading: loadingLife } = useLifecycleReport(
    filters,
    activeTab === "lifecycle"
  );
  const { data: departmentData, isLoading: loadingDept } = useDepartmentReport(
    filters,
    activeTab === "departments"
  );
  const { data: bookingData, isLoading: loadingBook } = useBookingReport(
    filters,
    activeTab === "bookings"
  );
  const { data: auditData, isLoading: loadingAudit } = useAuditReport(
    filters,
    activeTab === "audits"
  );

  const activeLoading =
    (activeTab === "utilization" && loadingUtil) ||
    (activeTab === "maintenance" && loadingMaint) ||
    (activeTab === "lifecycle" && loadingLife) ||
    (activeTab === "departments" && loadingDept) ||
    (activeTab === "bookings" && loadingBook) ||
    (activeTab === "audits" && loadingAudit);

  // ── 4. Export Action Handler ───────────────────────────────────────────────
  const handleExport = (format: "pdf" | "xlsx" | "csv") => {
    try {
      const url = reportsApi.getExportUrl(activeTab, format, filters);
      toast.success(`Generating ${format.toUpperCase()} export...`);
      // Trigger browser download by opening the attachment URL
      window.open(url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger export");
    }
  };

  // ── 5. Define Column Configurations for Report Tables ────────────────────────
  const utilizationColumns: ColumnDefinition[] = [
    { key: "assetTag", label: "Asset Tag" },
    { key: "assetName", label: "Asset Name" },
    { key: "allocationCount", label: "Total Assignments", render: (val) => <span className="font-bold">{val}</span> },
  ];

  const maintenanceColumns: ColumnDefinition[] = [
    { key: "requestId", label: "Request ID", render: (val) => <span className="font-mono text-[10px] text-slate-400">{val?.slice(0, 8)}...</span> },
    { key: "assetTag", label: "Asset Tag" },
    { key: "assetName", label: "Asset Name" },
    { key: "issueTitle", label: "Issue Reported" },
    {
      key: "priority",
      label: "Priority",
      render: (val) => {
        const colors: Record<string, string> = {
          HIGH: "text-red-700 bg-red-50",
          MEDIUM: "text-amber-700 bg-amber-50",
          LOW: "text-slate-700 bg-slate-50",
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${colors[val] || "bg-slate-100"}`}>
            {val}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700">
          {val?.replace(/_/g, " ")}
        </span>
      ),
    },
    { key: "detail", label: "Servicing Detail" },
  ];

  const lifecycleColumns: ColumnDefinition[] = [
    { key: "status", label: "Asset Status", render: (val) => <span className="capitalize">{val?.toLowerCase().replace(/_/g, " ")}</span> },
    { key: "count", label: "Assets Count", render: (val) => <span className="font-bold">{val}</span> },
    { key: "percentage", label: "Share Ratio", render: (val) => <span>{val}%</span> },
  ];

  const departmentColumns: ColumnDefinition[] = [
    { key: "departmentName", label: "Department" },
    { key: "totalAssets", label: "Total Assets" },
    { key: "allocatedAssets", label: "Allocated" },
    { key: "availableAssets", label: "Available" },
    { key: "bookableAssets", label: "Bookable" },
    { key: "employeeCount", label: "Headcount" },
  ];

  const bookingColumns: ColumnDefinition[] = [
    { key: "assetTag", label: "Asset Tag" },
    { key: "assetName", label: "Asset Name" },
    { key: "count", label: "Reservations Count", render: (val) => <span className="font-bold">{val}</span> },
  ];

  const auditColumns: ColumnDefinition[] = [
    { key: "name", label: "Audit Cycle" },
    { key: "scopeType", label: "Scope" },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const colors: Record<string, string> = {
          PLANNED: "text-slate-600 bg-slate-50",
          ACTIVE: "text-amber-700 bg-amber-50",
          COMPLETED: "text-emerald-700 bg-emerald-50",
          CANCELLED: "text-red-700 bg-red-50",
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${colors[val] || "bg-slate-100"}`}>
            {val}
          </span>
        );
      },
    },
    { key: "startDate", label: "Start Date", render: (val) => val ? new Date(val).toLocaleDateString("en-IN") : "—" },
    { key: "endDate", label: "End Date", render: (val) => val ? new Date(val).toLocaleDateString("en-IN") : "—" },
  ];

  return (
    <AppShell>
      <div className="px-6 py-8 space-y-8 max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Operational Analytics</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#050038] tracking-tight">
              Reports & Dashboard Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Interactive reports, utilization ratios, scheduling breakdowns, and exportable logs.
            </p>
          </div>

          {/* Export Controls */}
          <div className="flex flex-wrap items-center gap-2.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport("pdf")}
              className="h-8 text-[10px] font-bold rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-red-500" />
              Export PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport("xlsx")}
              className="h-8 text-[10px] font-bold rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 gap-1.5"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              Export Excel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport("csv")}
              className="h-8 text-[10px] font-bold rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 gap-1.5"
            >
              <FileDown className="h-3.5 w-3.5 text-indigo-600" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Collapsible Filters Card */}
        <ReportFilters
          filters={filters}
          onChange={setFilters}
          userRole={userRole}
          userDeptId={userDeptId}
          departments={departments.map((d) => ({ id: d.id, name: d.name }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          assets={assetsList.map((a) => ({ id: a.id, name: a.name }))}
          locations={locations}
          employees={employees.map((e) => ({ id: e.id, name: e.name }))}
        />

        {/* Report Selector Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as ReportType)}
          className="space-y-6"
        >
          <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 rounded-2xl p-1.5 border border-slate-200">
            <TabsTrigger
              value="utilization"
              className="rounded-xl text-xs py-2 px-3.5 font-bold data-[state=active]:bg-white data-[state=active]:text-[#050038] text-slate-500 gap-1.5"
            >
              <Activity className="h-3.5 w-3.5" />
              Asset Utilization
            </TabsTrigger>
            <TabsTrigger
              value="maintenance"
              className="rounded-xl text-xs py-2 px-3.5 font-bold data-[state=active]:bg-white data-[state=active]:text-[#050038] text-slate-500 gap-1.5"
            >
              <Wrench className="h-3.5 w-3.5" />
              Maintenance Logs
            </TabsTrigger>
            <TabsTrigger
              value="lifecycle"
              className="rounded-xl text-xs py-2 px-3.5 font-bold data-[state=active]:bg-white data-[state=active]:text-[#050038] text-slate-500 gap-1.5"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Lifecycle Status
            </TabsTrigger>
            <TabsTrigger
              value="departments"
              className="rounded-xl text-xs py-2 px-3.5 font-bold data-[state=active]:bg-white data-[state=active]:text-[#050038] text-slate-500 gap-1.5"
            >
              <Building2 className="h-3.5 w-3.5" />
              Department Summary
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="rounded-xl text-xs py-2 px-3.5 font-bold data-[state=active]:bg-white data-[state=active]:text-[#050038] text-slate-500 gap-1.5"
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              Booking Analytics
            </TabsTrigger>
            <TabsTrigger
              value="audits"
              className="rounded-xl text-xs py-2 px-3.5 font-bold data-[state=active]:bg-white data-[state=active]:text-[#050038] text-slate-500 gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Audit Analytics
            </TabsTrigger>
          </TabsList>

          {/* Render Loading Skeletons */}
          {activeLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200">
                <CardHeader className="p-5 border-b border-slate-100">
                  <Skeleton className="h-4 w-48 rounded bg-slate-100" />
                </CardHeader>
                <CardContent className="p-5">
                  <Skeleton className="h-[220px] w-full rounded bg-slate-100" />
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardHeader className="p-5 border-b border-slate-100">
                  <Skeleton className="h-4 w-48 rounded bg-slate-100" />
                </CardHeader>
                <CardContent className="p-5">
                  <Skeleton className="h-[220px] w-full rounded bg-slate-100" />
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* ── Asset Utilization Content ─────────────────────────────────── */}
              <TabsContent value="utilization" className="space-y-6 mt-0">
                {utilizationData && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <Card className="rounded-2xl border border-slate-200 bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                          <CardTitle className="text-sm font-bold text-[#050038]">Utilization Ratio</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                          <UtilizationSummaryChart summary={utilizationData.summary} />
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border border-slate-200 bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                          <CardTitle className="text-sm font-bold text-[#050038]">Top Utilized Assets</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                          <AssetUtilizationBarChart
                            data={utilizationData.mostUsed}
                            color="#4262ff"
                          />
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border border-slate-200 bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                          <CardTitle className="text-sm font-bold text-[#050038]">Least Utilized Assets</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                          <AssetUtilizationBarChart
                            data={utilizationData.leastUsed}
                            color="#ff7c65"
                          />
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asset Utilization Data</h2>
                      <ReportDataTable
                        columns={utilizationColumns}
                        data={[...utilizationData.mostUsed, ...utilizationData.leastUsed]}
                        searchPlaceholder="Search utilization list..."
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ── Maintenance Content ────────────────────────────────────────── */}
              <TabsContent value="maintenance" className="space-y-6 mt-0">
                {maintenanceData && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="rounded-2xl border border-slate-200 bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                          <CardTitle className="text-sm font-bold text-[#050038]">Maintenance Request Statuses</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                          <MaintenanceStatusChart summary={maintenanceData.summary} />
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border border-slate-200 bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                          <CardTitle className="text-sm font-bold text-[#050038]">Category Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 flex items-center justify-center min-h-[220px]">
                          {maintenanceData.byCategory.length === 0 ? (
                            <span className="text-xs text-slate-400">No logs by category</span>
                          ) : (
                            <div className="w-full grid grid-cols-2 gap-3 text-xs">
                              {maintenanceData.byCategory.map((cat, idx) => (
                                <div key={idx} className="p-2 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center">
                                  <span className="font-semibold text-slate-600 truncate max-w-[120px]">{cat.categoryName || "Unclassified"}</span>
                                  <span className="font-extrabold text-[#050038] bg-slate-100 px-2 py-0.5 rounded">{cat.count}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Servicing Logs & Handovers</h2>
                      <ReportDataTable
                        columns={maintenanceColumns}
                        data={[
                          ...maintenanceData.dueForMaintenance.overdue.map((o) => ({
                            ...o,
                            detail: `${o.daysInProgress} days in progress`,
                          })),
                          ...maintenanceData.dueForMaintenance.upcoming.map((u) => ({
                            ...u,
                            detail: "Due soon",
                          })),
                          ...maintenanceData.dueForMaintenance.recentlyServiced.map((r) => ({
                            ...r,
                            detail: `Serviced: ${r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString("en-IN") : "—"}`,
                          })),
                        ]}
                        searchPlaceholder="Search maintenance requests..."
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ── Asset Lifecycle Content ────────────────────────────────────── */}
              <TabsContent value="lifecycle" className="space-y-6 mt-0">
                {lifecycleData && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="rounded-2xl border border-slate-200 bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                          <CardTitle className="text-sm font-bold text-[#050038]">Asset Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                          <AssetLifecycleStatusChart data={lifecycleData.byStatus} total={lifecycleData.total} />
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border border-slate-200 bg-white flex flex-col justify-between">
                        <CardHeader className="p-5 border-b border-slate-100">
                          <CardTitle className="text-sm font-bold text-[#050038]">Lifecycle Summary Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 flex-1 flex flex-col justify-center space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {lifecycleData.byStatus.map((stat, idx) => (
                              <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.status.replace(/_/g, " ")}</p>
                                <div className="flex items-baseline gap-2 mt-1.5">
                                  <span className="text-xl font-extrabold text-[#050038]">{stat.count}</span>
                                  <span className="text-xs font-semibold text-slate-400">({stat.percentage}%)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asset Lifecycle Breakdown</h2>
                      <ReportDataTable
                        columns={lifecycleColumns}
                        data={lifecycleData.byStatus}
                        searchPlaceholder="Search lifecycle status..."
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ── Department Summary Content ─────────────────────────────────── */}
              <TabsContent value="departments" className="space-y-6 mt-0">
                {departmentData && (
                  <>
                    <Card className="rounded-2xl border border-slate-200 bg-white">
                      <CardHeader className="p-5 border-b border-slate-100">
                        <CardTitle className="text-sm font-bold text-[#050038]">Asset Allocation by Department</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <DepartmentSummaryChart data={departmentData.departments} />
                      </CardContent>
                    </Card>

                    <div className="space-y-3">
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Department Resource Summary</h2>
                      <ReportDataTable
                        columns={departmentColumns}
                        data={departmentData.departments}
                        searchPlaceholder="Search departments..."
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ── Booking Analytics Content ──────────────────────────────────── */}
              <TabsContent value="bookings" className="space-y-6 mt-0">
                {bookingData && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="rounded-2xl border border-slate-200 bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                          <CardTitle className="text-sm font-bold text-[#050038]">Bookings Over Time</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                          <BookingOverTimeChart data={bookingData.perDay} />
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border border-slate-200 bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                          <CardTitle className="text-sm font-bold text-[#050038]">Reservations Heatmap</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                          <BookingHeatmapChart peakHours={bookingData.peakHours} />
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asset Bookings Frequency</h2>
                      <ReportDataTable
                        columns={bookingColumns}
                        data={[...bookingData.mostBooked, ...bookingData.leastBooked]}
                        searchPlaceholder="Search bookings list..."
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ── Audit Analytics Content ────────────────────────────────────── */}
              <TabsContent value="audits" className="space-y-6 mt-0">
                {auditData && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="rounded-2xl border border-slate-200 bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                          <CardTitle className="text-sm font-bold text-[#050038]">Audit Status Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                          <AuditSummaryChart summary={auditData.summary} />
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border border-slate-200 bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                          <CardTitle className="text-sm font-bold text-[#050038]">Discrepancy Allocation</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                          <AuditDiscrepanciesChart discrepancies={auditData.discrepancies} />
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Audit Cycles</h2>
                      <ReportDataTable
                        columns={auditColumns}
                        data={auditData.recentCycles}
                        searchPlaceholder="Search audit cycles..."
                      />
                    </div>
                  </>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </AppShell>
  );
};
export default ReportsPage;
