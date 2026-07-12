import React, { useState, useMemo } from "react";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import { useMaintenanceRequests } from "../hooks/useMaintenance";
import { MaintenanceFilters } from "../components/MaintenanceFilters";
import { MaintenanceTable } from "../components/MaintenanceTable";
import { RaiseRequestDialog } from "../components/RaiseRequestDialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Plus, Search } from "lucide-react";
import type { MaintenanceQuery } from "../types";

const PAGE_LIMIT = 10;

export const MaintenanceDirectory: React.FC = () => {

  // Search & Filters State
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Partial<MaintenanceQuery>>({});
  const [page, setPage] = useState(1);

  // Dialog state
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);

  // Construct query payload
  const query: MaintenanceQuery = useMemo(() => {
    return {
      search: search || undefined,
      status: filters.status,
      priority: filters.priority,
      departmentId: filters.departmentId,
      technicianId: filters.technicianId,
      startDate: filters.startDate ? new Date(filters.startDate).toISOString() : undefined,
      endDate: filters.endDate ? new Date(filters.endDate).toISOString() : undefined,
      page,
      limit: PAGE_LIMIT,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
  }, [search, filters, page]);

  // Load Requests
  const { data: requestRes, isLoading } = useMaintenanceRequests(query);
  const requests = requestRes?.data ?? [];
  const meta = requestRes?.meta;

  const handleFilterChange = (newFilters: Partial<MaintenanceQuery>) => {
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
              <h1 className="text-xl font-bold text-ink">Maintenance Requests</h1>
              <p className="text-sm text-ink-subtle mt-0.5">
                Report broken equipment, submit service requests, and track maintenance workflows.
              </p>
            </div>
            <Button
              onClick={() => setIsRaiseOpen(true)}
              className="w-fit rounded-full bg-[#4262ff] hover:bg-[#3451e0] text-white font-semibold flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Raise Request
            </Button>
          </div>
        </div>

        {/* Directory Layout */}
        <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-6">
          {/* Side panel filters */}
          <MaintenanceFilters
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
                  placeholder="Search requests by title or details..."
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
            <MaintenanceTable
              data={requests}
              isLoading={isLoading}
              page={page}
              totalPages={meta?.totalPages ?? 1}
              onPageChange={setPage}
              total={meta?.total ?? 0}
            />
          </div>
        </div>

        {/* Raise Request Dialog */}
        {isRaiseOpen && (
          <RaiseRequestDialog
            open={isRaiseOpen}
            onOpenChange={setIsRaiseOpen}
          />
        )}
      </div>
    </AppShell>
  );
};
