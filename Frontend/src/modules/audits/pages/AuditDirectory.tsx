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
      <div className="min-h-screen bg-canvas">
        {/* Top Header */}
        <div className="border-b border-slate-200 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-ink flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-[#4262ff]" /> Asset Audits
              </h1>
              <p className="text-sm text-ink-subtle mt-0.5">
                Manage physical verification cycles, allocate auditors, and reconcile discrepancies.
              </p>
            </div>
            {canCreate && (
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="w-fit rounded-full bg-[#4262ff] hover:bg-[#3451e0] text-white font-semibold flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Create Audit Cycle
              </Button>
            )}
          </div>
        </div>

        {/* Directory Layout */}
        <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-6">
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
