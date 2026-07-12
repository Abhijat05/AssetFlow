import React, { useState, useMemo } from "react";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import { useAuth } from "../../../context/AuthContext";
import { Card } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { useActivityLogs } from "../hooks/useActivity";
import { ActivityFilters } from "../components/ActivityFilters";
import { ReportDataTable } from "../../reports/components/ReportDataTable";
import type { ColumnDefinition } from "../../reports/components/ReportDataTable";
import { orgApi } from "../../organization/services/api";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock } from "lucide-react";
import type { ActivityQuery } from "../types";

export const ActivityPage: React.FC = () => {
  const { role } = useAuth();
  const userRole = role || "EMPLOYEE";

  // ── 1. Load Employees list for Manager/Admin user filters ────────────────
  const { data: empsRes } = useQuery({
    queryKey: ["activity-filter-users"],
    queryFn: () => orgApi.getEmployees({ limit: 500 }),
    enabled: userRole !== "EMPLOYEE",
  });

  const usersList = useMemo(() => {
    return (empsRes?.data || []).map((e) => ({
      id: e.id,
      name: e.name,
    }));
  }, [empsRes]);

  // ── 2. Filters & Search State ─────────────────────────────────────────────
  const [filters, setFilters] = useState<ActivityQuery>({
    page: 1,
    limit: 100, // retrieve up to 100 records for client-side sorting/filtering
  });

  // Query Activity Logs
  const { data: logs = [], isLoading } = useActivityLogs(filters);

  // ── 3. Table Column Setup ──────────────────────────────────────────────────
  const columns: ColumnDefinition[] = [
    {
      key: "createdAt",
      label: "Timestamp",
      render: (val) => (
        <span className="flex items-center gap-1 text-[11px] text-slate-500 font-bold whitespace-nowrap">
          <Clock className="h-3 w-3 text-slate-400" />
          {new Date(val).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "userName",
      label: "User",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#050038] text-xs">{row.userName || "System"}</span>
          <span className="text-[10px] text-slate-400 font-semibold">{row.userEmail || "system@assetflow.com"}</span>
        </div>
      ),
    },
    {
      key: "module",
      label: "Module",
      render: (val) => (
        <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/50">
          {val}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (val) => {
        let color = "text-slate-700 bg-slate-50 border-slate-200";
        const act = val?.toUpperCase() || "";
        if (act.includes("CREATE") || act.includes("ADD") || act.includes("ALLOCATE")) {
          color = "text-emerald-700 bg-emerald-50 border-emerald-100";
        } else if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("MODIFY")) {
          color = "text-amber-700 bg-amber-50 border-amber-100";
        } else if (act.includes("DELETE") || act.includes("REMOVE") || act.includes("CANCEL")) {
          color = "text-red-700 bg-red-50 border-red-100";
        } else if (act.includes("APPROVE") || act.includes("VERIFY")) {
          color = "text-indigo-700 bg-indigo-50 border-indigo-100";
        }

        return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
            {val}
          </span>
        );
      },
    },
    {
      key: "entityType",
      label: "Entity",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-600 capitalize text-[11px]">
            {val?.toLowerCase() || "—"}
          </span>
          {row.entityId && (
            <span className="text-[9px] font-mono text-slate-400">
              ID: {row.entityId.slice(0, 8)}...
            </span>
          )}
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (val) => (
        <span className="text-slate-600 font-semibold text-xs leading-relaxed max-w-xs block truncate" title={val}>
          {val || "—"}
        </span>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="px-6 py-8 space-y-8 max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              <Activity className="h-3.5 w-3.5 text-[#4262ff]" />
              <span>Security & Audit Trails</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#050038] tracking-tight">
              Activity Audit Logs
            </h1>
            <p className="text-xs text-slate-500">
              Searchable, role-filtered system audit trails detailing actions, entities, and operators.
            </p>
          </div>
        </div>

        {/* Collapsible Filters Card */}
        <ActivityFilters
          filters={filters}
          onChange={setFilters}
          userRole={userRole}
          users={usersList}
        />

        {/* Audit Logs Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Audit Trails Record List
          </h2>
          {isLoading ? (
            <Card className="rounded-2xl border-slate-200 bg-white p-6">
              <div className="space-y-3">
                <Skeleton className="h-9 w-full bg-slate-50 rounded-xl" />
                <Skeleton className="h-10 w-full bg-slate-50 rounded-xl" />
                <Skeleton className="h-10 w-full bg-slate-50 rounded-xl" />
                <Skeleton className="h-10 w-full bg-slate-50 rounded-xl" />
              </div>
            </Card>
          ) : (
            <ReportDataTable
              columns={columns}
              data={logs}
              searchPlaceholder="Search logs by user, entity or description..."
            />
          )}
        </div>
      </div>
    </AppShell>
  );
};
export default ActivityPage;
