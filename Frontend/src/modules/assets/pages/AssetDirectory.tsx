import React, { useState, useCallback } from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useAssets } from "../hooks/useAssets";
import { AssetTable } from "../components/AssetTable";
import { AssetFilters } from "../components/AssetFilters";
import { RegisterAssetDialog } from "../components/RegisterAssetDialog";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import type { AssetQuery } from "../types";
import { Search, Plus, Database } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const PAGE_LIMIT = 15;

export const AssetDirectory: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === "DEPARTMENT_HEAD";

  // Query state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Pick<AssetQuery, "categoryId" | "departmentId" | "status" | "condition" | "isBookable">>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const query: AssetQuery = {
    search: search || undefined,
    ...filters,
    page,
    limit: PAGE_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  };

  const { data, isLoading } = useAssets(query);
  const assets = data?.data ?? [];
  const meta = data?.meta;

  const handleFilterChange = useCallback((newFilters: Partial<AssetQuery>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
              <Database className="h-6 w-6 text-brand-yellow" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Asset Registry Inventory</h1>
              <p className="text-xs text-slate-300 font-semibold mt-1">
                {meta ? `${meta.total} total enterprise assets registered` : "Enterprise asset database registry"}
              </p>
            </div>
          </div>
          
          {!isReadOnly && (
            <Button
              onClick={() => setDialogOpen(true)}
              className="relative z-10 rounded-xl bg-white hover:bg-slate-50 text-primary font-bold text-xs px-5 h-9 shrink-0 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Register New Asset
            </Button>
          )}
        </div>

        {/* Body content */}
        <div className="space-y-6 animate-reveal">
          {/* Search Bar */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="asset-search"
                placeholder="Search by name, tag, or serial number..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10 h-10 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
          </div>

        {/* Content: Filters + Table */}
        <div className="flex gap-6 items-start">
          {/* Sidebar Filters */}
          <AssetFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
          />

          {/* Table */}
          <div className="flex-1 min-w-0">
            <AssetTable
              data={assets}
              isLoading={isLoading}
              page={page}
              totalPages={meta?.totalPages ?? 1}
              total={meta?.total ?? 0}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <RegisterAssetDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </AppShell>
  );
};
