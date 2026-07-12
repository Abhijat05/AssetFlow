import React, { useState, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import { useAudits } from "../hooks/useAudits";
import { AuditFilters } from "../components/AuditFilters";
import { AuditTable } from "../components/AuditTable";
import { CreateAuditDialog } from "../components/CreateAuditDialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Plus, Search, ShieldCheck } from "lucide-react";
import type { AuditQuery } from "../types";

const PAGE_LIMIT = 10;

export const AuditDirectory: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || "EMPLOYEE";

  const canCreate = userRole === "ADMIN";

  // Search & Filters State
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Partial<AuditQuery>>({});
  const [page, setPage] = useState(1);

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Construct query payload
  const query: AuditQuery = useMemo(() => {
    return {
      name: search || undefined,
      status: filters.status,
      departmentId: filters.departmentId,
      location: filters.location,
      auditorId: filters.auditorId,
      startDate: filters.startDate ? new Date(filters.startDate).toISOString() : undefined,
      endDate: filters.endDate ? new Date(filters.endDate).toISOString() : undefined,
      page,
      limit: PAGE_LIMIT,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
  }, [search, filters, page]);

  // Load Audits
  const { data: auditRes, isLoading } = useAudits(query);
  const audits = auditRes?.data ?? [];
  const meta = auditRes?.meta;

  const handleFilterChange = (newFilters: Partial<AuditQuery>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilters({});
    setPage(1);
  };

  return (
    <AppShell>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Page Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/95 to-brand-blue p-6 text-white shadow-md border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-reveal">
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/[0.03] blur-3xl pointer-events-none transform translate-x-12 -translate-y-12" />
          <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-brand-yellow/8 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
              <ShieldCheck className="h-6 w-6 text-brand-yellow" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Asset Reconciliation Audits</h1>
              <p className="text-xs text-slate-300 font-semibold mt-1">
                Manage physical verification cycles, allocate auditors, and reconcile item discrepancies.
              </p>
            </div>
          </div>
          
          {canCreate && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="relative z-10 rounded-xl bg-white hover:bg-slate-50 text-primary font-bold text-xs px-5 h-9 shrink-0 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create Audit Cycle
            </Button>
          )}
        </div>

        {/* Directory Layout */}
        <div className="flex flex-col lg:flex-row gap-6 animate-reveal">
          {/* Side panel filters */}
          <AuditFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Main workspace container */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Search Bar */}
            <div className="flex items-center gap-3 bg-white p-3.5 border border-slate-200 rounded-2xl shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search audits by cycle name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* List Table */}
            <AuditTable
              data={audits}
              isLoading={isLoading}
              page={page}
              totalPages={meta?.totalPages ?? 1}
              onPageChange={setPage}
              total={meta?.total ?? 0}
            />
          </div>
        </div>

        {/* Create Audit Dialog */}
        {isCreateOpen && (
          <CreateAuditDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
          />
        )}
      </div>
    </AppShell>
  );
};
