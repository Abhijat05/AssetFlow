import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import {
  useMaintenanceRequest,
  useMaintenanceHistory,
  useApproveRequest,
  useRejectRequest,
  useAssignTechnician,
  useStartMaintenance,
  useResolveMaintenance,
  useUploadAttachment,
  useDeleteAttachment,
} from "../hooks/useMaintenance";
import { useEmployees } from "../../organization/hooks/useOrganization";
import { MaintenanceStatusBadge } from "../components/MaintenanceStatusBadge";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { Separator } from "../../../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  ArrowLeft,
  Calendar,
  User,
  Building,
  Clock,
  CheckCircle2,
  XCircle,
  Hammer,
  FileText,
  Trash2,
  Plus,
  Paperclip,
  Check,
  AlertCircle,
  File,
  Lock,
  Ban,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import type { MaintenancePriority } from "../types";

const formatSafeDate = (dateStr: string | null | undefined, template: string = "MMMM d, yyyy · h:mm a") => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return format(d, template);
  } catch {
    return "—";
  }
};

const PriorityBadge: React.FC<{ priority: MaintenancePriority }> = ({ priority }) => {
  const styles: Record<MaintenancePriority, string> = {
    LOW: "text-slate-700 bg-slate-50 border-slate-200",
    MEDIUM: "text-blue-700 bg-blue-50/80 border-blue-200",
    HIGH: "text-amber-700 bg-amber-50/80 border-amber-200",
    CRITICAL: "text-rose-700 bg-rose-50/80 border-rose-200 animate-pulse",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wider ${styles[priority]}`}>
      {priority}
    </span>
  );
};

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <div className="text-sm font-semibold text-ink mt-0.5 break-words">{value ?? "—"}</div>
    </div>
  </div>
);

export const MaintenanceDetail: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role || "EMPLOYEE";
  const currentUserId = user?.id || "";

  const canManageWorkflow = ["ADMIN", "ASSET_MANAGER"].includes(userRole);

  // Queries
  const { data: request, isLoading, isError, refetch } = useMaintenanceRequest(id);
  const { data: history = [], isLoading: isLoadingHistory } = useMaintenanceHistory(id);
  
  // Load technicians list for assignment dropdown
  const { data: employeesData } = useEmployees({ limit: 100 });
  const technicians = useMemo(() => employeesData?.data ?? [], [employeesData]);

  // Mutations
  const approveReq = useApproveRequest();
  const rejectReq = useRejectRequest();
  const assignTech = useAssignTechnician();
  const startMaint = useStartMaintenance();
  const resolveMaint = useResolveMaintenance();
  const uploadAttach = useUploadAttachment();
  const deleteAttach = useDeleteAttachment();

  // Workflow Dialog Action states
  const [activeAction, setActiveAction] = useState<"APPROVE" | "REJECT" | "ASSIGN" | "START" | "RESOLVE" | null>(null);
  const [remarks, setRemarks] = useState("");
  const [techId, setTechId] = useState("");
  const [resolNotes, setResolNotes] = useState("");
  const [isMutating, setIsMutating] = useState(false);

  // Attachments upload state
  const [isUploading, setIsUploading] = useState(false);

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-screen-lg mx-auto px-6 py-8 space-y-6">
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

  if (isError || !request) {
    return (
      <AppShell>
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-lg font-semibold text-ink">Request not found</p>
            <Button variant="outline" className="rounded-full" onClick={() => navigate("/maintenance")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const isReporter = request.reportedBy === currentUserId;
  const canUpload = isReporter || canManageWorkflow;

  const handleWorkflowSubmit = async () => {
    try {
      setIsMutating(true);
      if (activeAction === "APPROVE") {
        await approveReq.mutateAsync({ id: request.id, data: { approvalRemarks: remarks } });
      } else if (activeAction === "REJECT") {
        await rejectReq.mutateAsync({ id: request.id, data: { approvalRemarks: remarks } });
      } else if (activeAction === "ASSIGN") {
        await assignTech.mutateAsync({ id: request.id, data: { technicianId: techId } });
      } else if (activeAction === "START") {
        await startMaint.mutateAsync(request.id);
      } else if (activeAction === "RESOLVE") {
        await resolveMaint.mutateAsync({ id: request.id, data: { resolutionNotes: resolNotes } });
      }
      setActiveAction(null);
      setRemarks("");
      setTechId("");
      setResolNotes("");
    } catch {
      // Handled by Sonner toast
    } finally {
      setIsMutating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setIsUploading(true);
        await uploadAttach.mutateAsync({ id: request.id, file: e.target.files[0] });
        refetch();
      } catch {
        // Ignored
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDeleteAttachment = async (attachId: string) => {
    if (confirm("Are you sure you want to remove this attachment?")) {
      try {
        await deleteAttach.mutateAsync({ id: request.id, attachmentId: attachId });
        refetch();
      } catch {
        // Ignored
      }
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-canvas">
        {/* Header bar */}
        <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="max-w-screen-lg mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
                onClick={() => navigate("/maintenance")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-5" />
              <div>
                <h1 className="text-sm font-bold text-ink truncate max-w-[200px] sm:max-w-xs">
                  {request.issueTitle}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono">ID: {request.id.slice(0, 8)}</span>
                  <MaintenanceStatusBadge status={request.status} />
                </div>
              </div>
            </div>

            {/* Workflow Action Buttons for Managers */}
            {canManageWorkflow && (
              <div className="flex items-center gap-2">
                {request.status === "PENDING" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-emerald-600 border-emerald-250 hover:bg-emerald-50/50 flex items-center gap-1"
                      onClick={() => {
                        setRemarks("");
                        setActiveAction("APPROVE");
                      }}
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-rose-600 border-rose-200 hover:bg-rose-50/50 flex items-center gap-1"
                      onClick={() => {
                        setRemarks("");
                        setActiveAction("REJECT");
                      }}
                    >
                      <Ban className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </>
                )}

                {request.status === "APPROVED" && (
                  <Button
                    size="sm"
                    className="rounded-full bg-[#4262ff] hover:bg-[#3451e0] text-white flex items-center gap-1.5"
                    onClick={() => {
                      setTechId("");
                      setActiveAction("ASSIGN");
                    }}
                  >
                    <Hammer className="h-3.5 w-3.5" /> Assign Technician
                  </Button>
                )}

                {request.status === "TECHNICIAN_ASSIGNED" && (
                  <Button
                    size="sm"
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                    onClick={() => setActiveAction("START")}
                  >
                    <Clock className="h-3.5 w-3.5" /> Start Maintenance
                  </Button>
                )}

                {request.status === "IN_PROGRESS" && (
                  <Button
                    size="sm"
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                    onClick={() => {
                      setResolNotes("");
                      setActiveAction("RESOLVE");
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detail Layout */}
        <div className="max-w-screen-lg mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Content Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Ticket Details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#4262ff]" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Issue Details</h2>
                  </div>
                  <PriorityBadge priority={request.priority} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InfoRow
                    icon={<User className="h-4 w-4 text-slate-400" />}
                    label="Reported By"
                    value={request.reporterName || "Shared User"}
                  />
                  <InfoRow
                    icon={<Calendar className="h-4 w-4 text-slate-400" />}
                    label="Date Reported"
                    value={formatSafeDate(request.createdAt)}
                  />
                  <InfoRow
                    icon={<Hammer className="h-4 w-4 text-slate-400" />}
                    label="Assigned Technician"
                    value={request.technicianName || <span className="text-slate-400 italic">Unassigned</span>}
                  />
                  <InfoRow
                    icon={<Building className="h-4 w-4 text-slate-400" />}
                    label="Asset Location"
                    value={request.departmentName || "—"}
                  />
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1.5">Description of Issue</p>
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{request.issueDescription}</p>
                </div>
              </div>

              {/* Manager Remarks & Notes */}
              {(request.approvalRemarks || request.resolutionNotes) && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <FileText className="h-4 w-4 text-[#4262ff]" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Resolution & Approvals</h2>
                  </div>

                  {request.approvalRemarks && (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 font-medium">Approval/Rejection Remarks</p>
                      <div className="text-sm text-ink bg-slate-50 rounded-xl p-3 border border-slate-100 italic">
                        &ldquo;{request.approvalRemarks}&rdquo;
                        <div className="text-[10px] text-slate-400 not-italic font-medium mt-1">
                          by {request.approverName || "Manager"} · {formatSafeDate(request.approvedAt || request.updatedAt)}
                        </div>
                      </div>
                    </div>
                  )}

                  {request.resolutionNotes && (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 font-medium">Technician Resolution Notes</p>
                      <div className="text-sm text-ink bg-emerald-50/50 rounded-xl p-3 border border-emerald-100 italic">
                        &ldquo;{request.resolutionNotes}&rdquo;
                        <div className="text-[10px] text-emerald-700 not-italic font-medium mt-1">
                          by {request.technicianName || "Technician"} · {formatSafeDate(request.resolvedAt)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Attachments Section */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-[#4262ff]" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Attachments</h2>
                  </div>

                  {canUpload && (
                    <div className="relative">
                      <input
                        type="file"
                        id="detail-file-upload"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="absolute inset-0 opacity-0 cursor-pointer w-24"
                        title="Upload file"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isUploading}
                        className="h-8 rounded-full text-slate-600 flex items-center gap-1"
                      >
                        {isUploading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                        Add File
                      </Button>
                    </div>
                  )}
                </div>

                {!request.attachments || request.attachments.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center text-slate-400">
                    <Paperclip className="h-8 w-8 mb-1.5 opacity-30" />
                    <p className="text-xs font-medium">No attachments raised for this ticket.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {request.attachments.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow transition-shadow">
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 min-w-0 flex-1 hover:text-[#4262ff]"
                        >
                          <File className="h-5 w-5 text-[#4262ff] flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate text-slate-700">{file.fileName}</p>
                            {file.fileSize && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                          </div>
                        </a>

                        {canManageWorkflow && (
                          <button
                            onClick={() => handleDeleteAttachment(file.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Delete file"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visual Workflow Timeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Clock className="h-4 w-4 text-[#4262ff]" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Timeline Workflow</h2>
                </div>

                <div className="flex items-center justify-between max-w-lg mx-auto pt-4 pb-2">
                  {/* Step 1: Raised */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-250">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1">Raised</span>
                  </div>

                  <div className="h-[2px] bg-slate-200 flex-1 -mt-4" />

                  {/* Step 2: Approved */}
                  <div className="flex flex-col items-center flex-1">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                      request.status === "REJECTED"
                        ? "bg-rose-100 text-rose-700 border-rose-250"
                        : ["APPROVED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS", "RESOLVED"].includes(request.status)
                        ? "bg-emerald-100 text-emerald-700 border-emerald-250"
                        : "bg-amber-100 text-amber-700 border-amber-250 animate-pulse"
                    }`}>
                      {request.status === "REJECTED" ? (
                        <XCircle className="h-4 w-4" />
                      ) : ["APPROVED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS", "RESOLVED"].includes(request.status) ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        "2"
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1">
                      {request.status === "REJECTED" ? "Rejected" : "Approved"}
                    </span>
                  </div>

                  <div className="h-[2px] bg-slate-200 flex-1 -mt-4" />

                  {/* Step 3: Technician Assigned */}
                  <div className="flex flex-col items-center flex-1">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                      ["TECHNICIAN_ASSIGNED", "IN_PROGRESS", "RESOLVED"].includes(request.status)
                        ? "bg-emerald-100 text-emerald-700 border-emerald-250"
                        : request.status === "REJECTED"
                        ? "bg-slate-100 text-slate-300 border-slate-200"
                        : request.status === "APPROVED"
                        ? "bg-blue-100 text-blue-700 border-blue-250 animate-pulse"
                        : "bg-slate-100 text-slate-300 border-slate-200"
                    }`}>
                      {["TECHNICIAN_ASSIGNED", "IN_PROGRESS", "RESOLVED"].includes(request.status) ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        "3"
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1">Assigned</span>
                  </div>

                  <div className="h-[2px] bg-slate-200 flex-1 -mt-4" />

                  {/* Step 4: Resolved */}
                  <div className="flex flex-col items-center flex-1">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                      request.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-250"
                        : ["TECHNICIAN_ASSIGNED", "IN_PROGRESS"].includes(request.status)
                        ? "bg-blue-100 text-blue-700 border-blue-250 animate-pulse"
                        : "bg-slate-100 text-slate-300 border-slate-200"
                    }`}>
                      {request.status === "RESOLVED" ? <CheckCircle2 className="h-4 w-4" /> : "4"}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1">Resolved</span>
                  </div>
                </div>
              </div>

              {/* History / Audit Logs */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="h-4 w-4 text-[#4262ff]" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Activity Log</h2>
                </div>

                {isLoadingHistory ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center text-slate-400">
                    <Paperclip className="h-8 w-8 mb-1 opacity-30" />
                    <p className="text-xs font-medium">No system activity logged.</p>
                  </div>
                ) : (
                  <ol className="relative border-l border-slate-200 space-y-6 ml-3">
                    {history.map((entry) => (
                      <li key={entry.id} className="ml-6">
                        <span className="absolute -left-[9px] h-4 w-4 rounded-full border-2 border-white bg-[#4262ff] flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        </span>
                        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-[#4262ff] uppercase tracking-wide">
                              {entry.action.replace("MAINTENANCE_", "")}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatSafeDate(entry.createdAt)}
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

            {/* Right Asset Information card */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="h-4 w-4 text-[#4262ff]" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Asset Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-ink">{request.assetName}</h3>
                    <span className="font-mono text-xs font-semibold text-[#4262ff] bg-[#4262ff]/8 px-2 py-0.5 rounded-md mt-1.5 inline-block">
                      {request.assetTag}
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 text-xs">
                      <Building className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Department</p>
                        <p className="font-bold text-ink mt-0.5">{request.departmentName || "—"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2.5 text-xs">
                      <Lock className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Asset Lock State</p>
                        <p className="font-bold text-ink mt-0.5">
                          {["APPROVED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS"].includes(request.status) ? (
                            <span className="text-amber-600">Locked Under Maintenance</span>
                          ) : (
                            <span className="text-emerald-600">Unlocked / Normal Operations</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modals for Manager Actions */}
        {activeAction && (
          <Dialog open={!!activeAction} onOpenChange={(open) => !open && setActiveAction(null)}>
            <DialogContent className="max-w-md bg-canvas">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-ink">
                  {activeAction === "APPROVE" && "Approve Request"}
                  {activeAction === "REJECT" && "Reject Request"}
                  {activeAction === "ASSIGN" && "Assign Technician"}
                  {activeAction === "START" && "Start Servicing"}
                  {activeAction === "RESOLVE" && "Resolve Maintenance"}
                </DialogTitle>
                <DialogDescription className="text-sm text-ink-subtle">
                  {activeAction === "APPROVE" && "Provide approval remarks below to proceed with servicing."}
                  {activeAction === "REJECT" && "Provide rejection remarks below describing the reason."}
                  {activeAction === "ASSIGN" && "Choose an employee as the technician assigned to this issue."}
                  {activeAction === "START" && "Confirm starting maintenance. This marks request status as In Progress."}
                  {activeAction === "RESOLVE" && "Provide resolution details to close this ticket."}
                </DialogDescription>
              </DialogHeader>

              {/* Action specific bodies */}
              {(activeAction === "APPROVE" || activeAction === "REJECT") && (
                <div className="space-y-1.5 pt-2 flex flex-col">
                  <Label htmlFor="remarks">Approval/Rejection Remarks</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Enter remarks..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {activeAction === "ASSIGN" && (
                <div className="space-y-1.5 pt-2 flex flex-col">
                  <Label htmlFor="technician">Technician</Label>
                  <Select value={techId} onValueChange={setTechId}>
                    <SelectTrigger id="technician">
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activeAction === "RESOLVE" && (
                <div className="space-y-1.5 pt-2 flex flex-col">
                  <Label htmlFor="resolNotes">Resolution Notes</Label>
                  <Textarea
                    id="resolNotes"
                    placeholder="Describe how the issue was fixed, replacing parts, testing, etc..."
                    value={resolNotes}
                    onChange={(e) => setResolNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <DialogFooter className="pt-4 flex gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setActiveAction(null)}
                  disabled={isMutating}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWorkflowSubmit}
                  disabled={isMutating || (activeAction === "ASSIGN" && !techId)}
                  className={`rounded-full text-white font-semibold ${
                    activeAction === "REJECT" ? "bg-rose-600 hover:bg-rose-700" : "bg-[#4262ff] hover:bg-[#3451e0]"
                  }`}
                >
                  {isMutating ? "Processing..." : "Confirm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </AppShell>
  );
};
