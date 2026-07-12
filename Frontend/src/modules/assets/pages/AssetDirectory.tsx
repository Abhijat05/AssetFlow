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
      <div className="min-h-screen bg-canvas">
      {/* Page Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#4262ff]/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-[#4262ff]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-ink tracking-tight">Asset Registry</h1>
                <p className="text-sm text-ink-subtle">
                  {meta ? `${meta.total} total assets` : "Enterprise asset inventory"}
                </p>
              </div>
            </div>
            {!isReadOnly && (
              <Button
                onClick={() => setDialogOpen(true)}
                className="rounded-full bg-[#4262ff] hover:bg-[#3451e0] text-white font-semibold px-5 h-10 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Register Asset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="asset-search"
              placeholder="Search by name, tag, or serial number..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10 h-10 rounded-full border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-[#4262ff]/20"
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
