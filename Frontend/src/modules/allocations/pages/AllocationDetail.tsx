import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import {
  useAllocation,
  useAllocationHistory,
  useTransferRequests,
  useApproveTransfer,
  useRejectTransfer,
} from "../hooks/useAllocations";
import { AllocationStatusBadge } from "../components/AllocationStatusBadge";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { Separator } from "../../../components/ui/separator";
import { ReturnRequestDialog } from "../components/ReturnRequestDialog";

import { TransferRequestDialog } from "../components/TransferRequestDialog";
import {
  ArrowLeft,
  Package,
  Calendar,
  User,
  Building,
  Clock,
  ArrowRightLeft,
  Reply,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

const formatSafeDate = (dateStr: string | null | undefined, template: string = "MMM d, yyyy") => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return format(d, template);
  } catch {
    return "—";
  }
};

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <div className="text-sm font-semibold text-ink mt-0.5 wrap-break-word">{value ?? "—"}</div>
    </div>
  </div>
);

export const AllocationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role || "EMPLOYEE";
  const currentUserId = user?.id || "";
  const allocationId = id && id !== "undefined" && id !== "null" ? id : "";

  // Queries
  const { data: allocation, isLoading, isError } = useAllocation(allocationId);
  const { data: history = [], isLoading: isLoadingHistory } = useAllocationHistory(allocationId);
  const { data: transfers = [] } = useTransferRequests(allocationId);

  // Mutations
  const approveTransfer = useApproveTransfer(allocationId);
  const rejectTransfer = useRejectTransfer(allocationId);

  // Dialog states
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isReturnApproving, setIsReturnApproving] = useState(false);

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (isError || !allocation) {
    return (
      <AppShell>
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-lg font-semibold text-ink">Allocation not found</p>
            <Button variant="outline" className="rounded-full" onClick={() => navigate("/allocations")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const isCurrentHolder = allocation.employeeId === currentUserId;
  const isAdminOrManager = ["ADMIN", "ASSET_MANAGER"].includes(userRole);
  const isDeptHead = userRole === "DEPARTMENT_HEAD";
  const isDeptHeadForAssignee = isDeptHead && allocation.departmentId === (user as unknown as { departmentId?: string | null })?.departmentId;

  // Active transfer request
  const pendingTransfer = transfers.find((t) => t.status === "PENDING");

  return (
    <AppShell>
      <div className="min-h-screen bg-canvas">
        {/* Header bar */}
        <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/allocations")}
                className="rounded-full text-slate-600 h-9 gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-base font-bold text-ink leading-tight">Allocation Details</h1>
                <span className="font-mono text-xs text-brand-blue font-semibold">{allocation.asset.assetTag}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AllocationStatusBadge status={allocation.status} />
            </div>
          </div>
        </div>

        {/* Detail Contents */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left layout */}
            <div className="lg:col-span-2 space-y-6">

              {/* Holder Assignment details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Current Assignment</h2>
                  <div className="flex gap-2">
                    {isCurrentHolder && allocation.status === "ACTIVE" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setIsReturnOpen(true); setIsReturnApproving(false); }}
                          className="rounded-full h-8 text-xs border-slate-200"
                        >
                          <Reply className="h-3 w-3 mr-1.5" /> Request Return
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsTransferOpen(true)}
                          className="rounded-full h-8 text-xs border-slate-200 text-brand-blue"
                        >
                          <ArrowRightLeft className="h-3 w-3 mr-1.5" /> Request Transfer
                        </Button>
                      </>
                    )}

                    {isAdminOrManager && allocation.status === "RETURN_REQUESTED" && (
                      <Button
                        onClick={() => { setIsReturnOpen(true); setIsReturnApproving(true); }}
                        className="rounded-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="h-3 w-3 mr-1.5" /> Complete Return
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InfoRow
                    icon={<User className="h-4 w-4 text-slate-400" />}
                    label="Assigned Employee"
                    value={allocation.employee?.name ?? "Shared Resource"}
                  />
                  <InfoRow
                    icon={<Building className="h-4 w-4 text-slate-400" />}
                    label="Assigned Department"
                    value={allocation.department?.name ?? "—"}
                  />
                  <InfoRow
                    icon={<Calendar className="h-4 w-4 text-slate-400" />}
                    label="Allocated Date"
                    value={formatSafeDate(allocation.allocatedAt, "MMMM d, yyyy")}
                  />
                  <InfoRow
                    icon={<Clock className="h-4 w-4 text-slate-400" />}
                    label="Expected Return Date"
                    value={allocation.expectedReturnDate ? formatSafeDate(allocation.expectedReturnDate, "MMMM d, yyyy") : "Permanent Allocation"}
                  />
                </div>
                {allocation.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">Allocation Notes</p>
                      <p className="text-sm text-ink leading-relaxed">{allocation.notes}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Pending Transfer Requests */}
              {pendingTransfer && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-blue-800 font-bold text-sm uppercase tracking-wider">
                    <ArrowRightLeft className="h-4 w-4" />
                    Pending Transfer Request
                  </div>
                  <div className="text-sm text-blue-900 space-y-2">
                    <p>
                      Request to transfer asset to <strong>{pendingTransfer.targetEmployee.name}</strong>
                      {pendingTransfer.targetDepartment && <> in department <strong>{pendingTransfer.targetDepartment.name}</strong></>}.
                    </p>
                    {pendingTransfer.reason && (
                      <p className="italic text-xs bg-white border border-blue-100 p-2.5 rounded-xl text-slate-600">
                        " {pendingTransfer.reason} "
                      </p>
                    )}
                  </div>
                  
                  {/* Action buttons (Admin, Asset Manager, or Department Head of target/requesting dept) */}
                  {(isAdminOrManager || isDeptHeadForAssignee) && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        disabled={approveTransfer.isPending || rejectTransfer.isPending}
                        onClick={() => approveTransfer.mutate(pendingTransfer.id)}
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold px-4"
                      >
                        <Check className="h-3 w-3 mr-1.5" /> Approve Transfer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={approveTransfer.isPending || rejectTransfer.isPending}
                        onClick={() => rejectTransfer.mutate({ transferRequestId: pendingTransfer.id })}
                        className="rounded-full h-8 text-xs font-semibold border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 px-4"
                      >
                        <X className="h-3 w-3 mr-1.5" /> Reject Request
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* History Timeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">History Timeline</h2>
                
                {isLoadingHistory ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center text-slate-400">
                    <Clock className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm font-medium">No timeline logs found.</p>
                  </div>
                ) : (
                  <ol className="relative border-l border-slate-200 space-y-6 ml-3">
                    {history.map((entry) => (
                      <li key={entry.id} className="ml-6">
                        <span className="absolute -left-2.25 h-4 w-4 rounded-full border-2 border-white bg-brand-blue flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        </span>
                        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-brand-blue uppercase tracking-wide">{entry.action}</span>
                            <span className="text-xs text-slate-400">
                              {formatSafeDate(entry.createdAt, "MMM d, yyyy · h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm text-ink">{entry.description}</p>
                          <p className="text-xs text-slate-400 mt-1">by {entry.performedByName}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            {/* Right layout */}
            <div className="space-y-6">
              
              {/* Asset Information Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Asset Profile</h2>
                
                <div className="space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <Package className="h-7 w-7 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink">{allocation.asset.name}</h3>
                    <span className="font-mono text-xs font-semibold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {allocation.asset.assetTag}
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Asset ID</span>
                      <span className="font-mono text-xs text-slate-400">{allocation.asset.id.slice(0, 8)}…</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Wear Condition</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                        {allocation.asset.condition}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Log History (if any returned dates exist) */}
              {allocation.returnedAt && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Return Log</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Returned Date</span>
                      <span className="font-semibold text-ink">
                        {formatSafeDate(allocation.returnedAt, "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Dialog Modulators */}
        {isReturnOpen && (
          <ReturnRequestDialog
            open={isReturnOpen}
            onOpenChange={setIsReturnOpen}
            allocationId={allocation.id}
            isApproving={isReturnApproving}
          />
        )}

        {isTransferOpen && (
          <TransferRequestDialog
            open={isTransferOpen}
            onOpenChange={setIsTransferOpen}
            allocationId={allocation.id}
            assetId={allocation.assetId}
            currentHolderName={allocation.employee?.name || "Shared"}
          />
        )}
      </div>
    </AppShell>
  );
};
