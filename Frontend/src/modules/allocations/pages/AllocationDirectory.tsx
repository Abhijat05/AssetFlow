import React, { useState, useCallback, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import { useAllocations } from "../hooks/useAllocations";
import { AllocationTable } from "../components/AllocationTable";
import { AllocateAssetDialog } from "../components/AllocateAssetDialog";
import { TransferRequestDialog } from "../components/TransferRequestDialog";
import { ReturnRequestDialog } from "../components/ReturnRequestDialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useDepartments, useEmployees } from "../../organization/hooks/useOrganization";
import type { AllocationQuery, Allocation, AllocationStatus } from "../types";
import { Search, Plus, SlidersHorizontal, X, UserCheck } from "lucide-react";

const PAGE_LIMIT = 15;

const STATUSES: { value: AllocationStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "RETURN_REQUESTED", label: "Return Requested" },
  { value: "RETURNED", label: "Returned" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "TRANSFER_PENDING", label: "Transfer Pending" },
  { value: "TRANSFERRED", label: "Transferred" },
];

export const AllocationDirectory: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user?.id || "";
  const userRole = user?.role || "EMPLOYEE";

  const isAdminOrManager = ["ADMIN", "ASSET_MANAGER"].includes(userRole);

  // Queries
  const { data: departments = [] } = useDepartments();
  const { data: employeesData } = useEmployees({ limit: 100 });
  const employees = employeesData?.data ?? [];

  // Search & Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [empFilter, setEmpFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // Dialog States
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [selectedAllocationForReturn, setSelectedAllocationForReturn] = useState<Allocation | null>(null);
  const [selectedAllocationForTransfer, setSelectedAllocationForTransfer] = useState<Allocation | null>(null);
  const [isReturnApproving, setIsReturnApproving] = useState(false);

  // Construct search query
  const query: AllocationQuery = useMemo(() => {
    const q: AllocationQuery = {
      search: search || undefined,
      status: statusFilter !== "all" ? (statusFilter as AllocationStatus) : undefined,
      departmentId: deptFilter !== "all" ? deptFilter : undefined,
      employeeId: userRole === "EMPLOYEE" ? currentUserId : (empFilter !== "all" ? empFilter : undefined),
      expectedReturnDateFrom: startDate ? new Date(startDate).toISOString() : undefined,
      expectedReturnDateTo: endDate ? new Date(endDate).toISOString() : undefined,
      page,
      limit: PAGE_LIMIT,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    return q;
  }, [search, statusFilter, deptFilter, empFilter, startDate, endDate, page, userRole, currentUserId]);

  const { data: allocationsData, isLoading } = useAllocations(query, userRole === "EMPLOYEE");
  const allocations = allocationsData?.data ?? [];
  const meta = allocationsData?.meta;

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDeptFilter("all");
    setEmpFilter("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleReturnRequest = useCallback((alloc: Allocation) => {
    setSelectedAllocationForReturn(alloc);
    setIsReturnApproving(false);
  }, []);

  const handleCompleteReturn = useCallback((alloc: Allocation) => {
    setSelectedAllocationForReturn(alloc);
    setIsReturnApproving(true);
  }, []);

  const handleTransferRequest = useCallback((alloc: Allocation) => {
    setSelectedAllocationForTransfer(alloc);
  }, []);

  const hasActiveFilters =
    statusFilter !== "all" ||
    deptFilter !== "all" ||
    (userRole !== "EMPLOYEE" && empFilter !== "all") ||
    startDate !== "" ||
    endDate !== "";

  return (
    <AppShell>
      <div className="min-h-screen bg-canvas">
        {/* Page Header */}
        <div className="border-b border-slate-200 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#4262ff]/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-[#4262ff]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-ink tracking-tight">Resource Allocations</h1>
                  <p className="text-sm text-ink-subtle">
                    {meta ? `${meta.total} total allocations` : "Track asset holders & transfer requests"}
                  </p>
                </div>
              </div>
              {isAdminOrManager && (
                <Button
                  onClick={() => setIsAllocateOpen(true)}
                  className="rounded-full bg-[#4262ff] hover:bg-[#3451e0] text-white font-semibold px-5 h-10 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Allocate Asset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="max-w-screen-xl mx-auto px-6 py-6">
          <div className="flex gap-6 items-start">
            {/* Sidebar filter panel */}
            <div className="w-64 flex-shrink-0 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-bold text-ink">Filters</span>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <X className="h-3 w-3" /> Reset
                  </button>
                )}
              </div>

              {/* Status filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</Label>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</Label>
                <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1); }}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employee filter (only for non-employees) */}
              {userRole !== "EMPLOYEE" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignee</Label>
                  <Select value={empFilter} onValueChange={(v) => { setEmpFilter(v); setPage(1); }}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All assignees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All assignees</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date filters */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Table & search section */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="alloc-search"
                  placeholder="Search by asset, tag, or employee..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-10 h-10 rounded-full border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-[#4262ff]/20"
                />
              </div>

              <AllocationTable
                data={allocations}
                isLoading={isLoading}
                page={page}
                totalPages={meta?.totalPages ?? 1}
                total={meta?.total ?? 0}
                onPageChange={setPage}
                onReturnRequest={handleReturnRequest}
                onTransferRequest={handleTransferRequest}
                onCompleteReturn={handleCompleteReturn}
                userRole={userRole}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        </div>

        {/* Dialog modulators */}
        <AllocateAssetDialog open={isAllocateOpen} onOpenChange={setIsAllocateOpen} />

        {selectedAllocationForReturn && (
          <ReturnRequestDialog
            open={!!selectedAllocationForReturn}
            onOpenChange={(open) => !open && setSelectedAllocationForReturn(null)}
            allocationId={selectedAllocationForReturn.id}
            isApproving={isReturnApproving}
          />
        )}

        {selectedAllocationForTransfer && (
          <TransferRequestDialog
            open={!!selectedAllocationForTransfer}
            onOpenChange={(open) => !open && setSelectedAllocationForTransfer(null)}
            allocationId={selectedAllocationForTransfer.id}
            assetId={selectedAllocationForTransfer.assetId}
            currentHolderName={selectedAllocationForTransfer.employee?.name || "Shared"}
          />
        )}
      </div>
    </AppShell>
  );
};
