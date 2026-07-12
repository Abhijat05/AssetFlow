import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import {
  useAudit,
  useVerifyAsset,
  useCloseAudit,
  useUpdateAudit,
  useDiscrepancyReport,
} from "../hooks/useAudits";
import { AuditStatusBadge } from "../components/AuditStatusBadge";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { Separator } from "../../../components/ui/separator";
import { Progress } from "../../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  ArrowLeft,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Check,
  Ban,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Search,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import type { AuditRecord, VerificationStatus } from "../types";

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

const VerificationStatusBadge: React.FC<{ status: VerificationStatus | null }> = ({ status }) => {
  if (!status) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border border-slate-200 text-slate-500 bg-slate-50">
        Unverified
      </span>
    );
  }
  const styles: Record<VerificationStatus, string> = {
    VERIFIED: "text-emerald-700 bg-emerald-50 border-emerald-200",
    MISSING: "text-rose-700 bg-rose-50 border-rose-250 animate-pulse",
    DAMAGED: "text-amber-700 bg-amber-50 border-amber-250",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
};

export const AuditDetail: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role || "EMPLOYEE";
  const currentUserId = user?.id || "";

  const canManage = ["ADMIN", "ASSET_MANAGER"].includes(userRole);
  const isAdmin = userRole === "ADMIN";

  // Queries
  const { data: audit, isLoading, isError, refetch } = useAudit(id);

  // Load discrepancy report for exports
  const { data: discrepancyData } = useDiscrepancyReport(id, canManage);

  // Mutations
  const verifyAssetMutation = useVerifyAsset();
  const closeAuditMutation = useCloseAudit();
  const updateAuditMutation = useUpdateAudit(id);

  // Action / verification state modal
  const [verifyingRecord, setVerifyingRecord] = useState<AuditRecord | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [verificationRemarks, setVerificationRemarks] = useState("");
  const [isVerifyingMutating, setIsVerifyingMutating] = useState(false);

  // Status transitions
  const [isClosingConfirm, setIsClosingConfirm] = useState(false);
  const [isStatusTransition, setIsStatusTransition] = useState<"ACTIVE" | "CANCELLED" | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Verification table tab / search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState<"ALL" | "VERIFIED" | "MISSING" | "DAMAGED" | "UNVERIFIED">("ALL");

  // Records mapping from nested object
  const records: AuditRecord[] = useMemo(() => {
    return (
      audit?.records?.map((r) => ({
        ...r.record,
        assetTag: r.assetTag,
        assetName: r.assetName,
        assetStatus: r.assetStatus,
        assetLocation: r.assetLocation,
        departmentName: r.departmentName,
        verifierName: r.verifierName,
      })) ?? []
    );
  }, [audit]);

  // Filtered records for table view
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchSearch =
        rec.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.assetTag?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTab =
        statusTab === "ALL" ||
        (statusTab === "UNVERIFIED" && rec.verificationStatus === null) ||
        rec.verificationStatus === statusTab;

      return matchSearch && matchTab;
    });
  }, [records, searchTerm, statusTab]);

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

  if (isError || !audit) {
    return (
      <AppShell>
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-lg font-semibold text-ink">Audit cycle not found</p>
            <Button variant="outline" className="rounded-full" onClick={() => navigate("/audits")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Check if current user is an assigned auditor
  const isAssignedAuditor = audit.auditors?.some((a) => a.auditorId === currentUserId) || false;
  // Auditors and managers can verify
  const canVerify = (isAssignedAuditor || canManage) && audit.status === "ACTIVE";

  // Statistics calculation
  const stats = audit.stats || { total: 0, verified: 0, missing: 0, damaged: 0, unverified: 0 };
  const checked = stats.total - stats.unverified;
  const progressPercent = stats.total > 0 ? Math.round((checked / stats.total) * 100) : 0;

  const handleVerifySubmit = async () => {
    if (!verifyingRecord || !verificationStatus) return;
    try {
      setIsVerifyingMutating(true);
      await verifyAssetMutation.mutateAsync({
        auditId: audit.id,
        assetId: verifyingRecord.assetId,
        data: {
          verificationStatus,
          remarks: verificationRemarks || null,
        },
      });
      setVerifyingRecord(null);
      setVerificationStatus(null);
      setVerificationRemarks("");
      refetch();
    } catch {
      // Ignored
    } finally {
      setIsVerifyingMutating(false);
    }
  };

  const handleCloseAuditSubmit = async () => {
    try {
      setIsTransitioning(true);
      await closeAuditMutation.mutateAsync(audit.id);
      setIsClosingConfirm(false);
      refetch();
    } catch {
      // Ignored
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleStatusTransitionSubmit = async () => {
    if (!isStatusTransition) return;
    try {
      setIsTransitioning(true);
      await updateAuditMutation.mutateAsync({ status: isStatusTransition });
      setIsStatusTransition(null);
      refetch();
    } catch {
      // Ignored
    } finally {
      setIsTransitioning(false);
    }
  };

  // CSV Exporter for discrepancies
  const handleExportCSV = () => {
    if (!discrepancyData) return;
    const reportRows = [
      ["Reconciliation Asset Tag", "Asset Name", "Verification Status", "Reconciliation Remarks", "Verified By"],
      ...discrepancyData.missing.map((m) => [
        m.assetTag,
        m.assetName,
        m.record.verificationStatus || "",
        m.record.remarks || "",
        m.verifierName || "System",
      ]),
      ...discrepancyData.damaged.map((d) => [
        d.assetTag,
        d.assetName,
        d.record.verificationStatus || "",
        d.record.remarks || "",
        d.verifierName || "System",
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + reportRows.map((e) => e.map(val => `"${val}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `discrepancies_${audit.name.replace(/\s+/g, "_").toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Exporter (styled print)
  const handleExportPDF = () => {
    if (!discrepancyData) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const discrepancyRowsHtml = [
      ...discrepancyData.missing,
      ...discrepancyData.damaged,
    ]
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-family: monospace;">${item.assetTag}</td>
          <td style="padding: 10px;">${item.assetName}</td>
          <td style="padding: 10px; font-weight: bold; color: ${item.record.verificationStatus === "MISSING" ? "#e11d48" : "#d97706"};">${item.record.verificationStatus}</td>
          <td style="padding: 10px; font-style: italic;">${item.record.remarks || "—"}</td>
          <td style="padding: 10px;">${item.verifierName || "System"}</td>
        </tr>`
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Discrepancy Report - ${audit.name}</title>
          <style>
            body { font-family: -apple-system, sans-serif; color: #1e293b; padding: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background-color: #f8fafc; padding: 12px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 30px; }
            .stats-box { display: flex; gap: 40px; margin-top: 20px; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .stat-item { font-size: 14px; }
            .stat-val { font-weight: bold; font-size: 18px; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin: 0; font-size: 24px;">Asset Audit Discrepancy Report</h1>
              <p style="margin: 5px 0 0 0; color: #64748b;">Cycle: ${audit.name}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">Generated On: ${new Date().toLocaleDateString()}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Status: ${audit.status}</p>
            </div>
          </div>
          
          <div class="stats-box">
            <div class="stat-item">Total Scoped Assets<div class="stat-val">${stats.total}</div></div>
            <div class="stat-item" style="color: #e11d48;">Missing Assets<div class="stat-val">${stats.missing}</div></div>
            <div class="stat-item" style="color: #d97706;">Damaged Assets<div class="stat-val">${stats.damaged}</div></div>
            <div class="stat-item" style="color: #10b981;">Verified Assets<div class="stat-val">${stats.verified}</div></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Reconciliation Status</th>
                <th>Verification Remarks</th>
                <th>Verified By</th>
              </tr>
            </thead>
            <tbody>
              ${discrepancyRowsHtml || '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #64748b;">No discrepancies logged. All checked assets are intact!</td></tr>'}
            </tbody>
          </table>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
                onClick={() => navigate("/audits")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-5" />
              <div>
                <h1 className="text-sm font-bold text-ink truncate max-w-[200px] sm:max-w-xs">
                  {audit.name}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono">Scope: {audit.scopeType}</span>
                  <AuditStatusBadge status={audit.status} />
                </div>
              </div>
            </div>

            {/* Status transitions for Admin */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                {audit.status === "PLANNED" && (
                  <>
                    <Button
                      size="sm"
                      className="rounded-full bg-[#4262ff] hover:bg-[#3451e0] text-white flex items-center gap-1.5"
                      onClick={() => setIsStatusTransition("ACTIVE")}
                    >
                      <Check className="h-3.5 w-3.5" /> Start Audit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-rose-600 border-rose-200 hover:bg-rose-50/50 flex items-center gap-1.5"
                      onClick={() => setIsStatusTransition("CANCELLED")}
                    >
                      <Ban className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  </>
                )}

                {audit.status === "ACTIVE" && (
                  <>
                    <Button
                      size="sm"
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                      onClick={() => setIsClosingConfirm(true)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Close Audit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-rose-600 border-rose-200 hover:bg-rose-50/50 flex items-center gap-1.5"
                      onClick={() => setIsStatusTransition("CANCELLED")}
                    >
                      <Ban className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Details Layout */}
        <div className="max-w-screen-lg mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Content column: Tabs */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Progress Summary */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-ink">Reconciliation Verification Progress</h2>
                    <p className="text-xs text-ink-subtle mt-0.5">Summary of physical counts and discrepancy rates.</p>
                  </div>
                  <span className="text-lg font-extrabold text-[#4262ff]">{progressPercent}%</span>
                </div>

                <Progress value={progressPercent} className="h-2" />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Checked</span>
                    <p className="text-lg font-bold text-slate-800 mt-1">{checked} <span className="text-xs font-semibold text-slate-400">/ {stats.total}</span></p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Verified Intact</span>
                    <p className="text-lg font-bold text-emerald-800 mt-1">{stats.verified}</p>
                  </div>
                  <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-3">
                    <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider">Missing</span>
                    <p className="text-lg font-bold text-rose-800 mt-1">{stats.missing}</p>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-3">
                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Damaged</span>
                    <p className="text-lg font-bold text-amber-800 mt-1">{stats.damaged}</p>
                  </div>
                </div>
              </div>

              {/* Main Tabs Container */}
              <Tabs defaultValue="verification" className="w-full">
                <TabsList className="w-full justify-start rounded-xl border border-slate-200 bg-white p-1 h-fit shadow-sm">
                  <TabsTrigger value="verification" className="rounded-lg py-2 px-4 text-xs font-bold transition-all data-[state=active]:bg-[#4262ff] data-[state=active]:text-white">
                    Verification Sheets
                  </TabsTrigger>
                  {canManage && (
                    <TabsTrigger value="discrepancy" className="rounded-lg py-2 px-4 text-xs font-bold transition-all data-[state=active]:bg-[#4262ff] data-[state=active]:text-white">
                      Discrepancy Log
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* Verification sheet */}
                <TabsContent value="verification" className="space-y-4 pt-4">
                  {/* Table search & sub-filters */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 border border-slate-200 rounded-2xl shadow-sm">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                      <input
                        placeholder="Search verification assets by tag or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-9 text-xs w-full bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4262ff] transition-all"
                      />
                    </div>
                    
                    {/* Status quick tabs */}
                    <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50/50 w-full sm:w-auto overflow-x-auto">
                      {(["ALL", "UNVERIFIED", "VERIFIED", "MISSING", "DAMAGED"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setStatusTab(tab)}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                            statusTab === tab ? "bg-white text-[#4262ff] shadow-sm" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verification Table */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3 text-left">Asset Tag</th>
                            <th className="px-4 py-3 text-left">Asset Name</th>
                            <th className="px-4 py-3 text-left">Department</th>
                            <th className="px-4 py-3 text-left">Audit Status</th>
                            <th className="px-4 py-3 text-left">Verifier</th>
                            <th className="px-4 py-3 text-left">Remarks</th>
                            {canVerify && <th className="px-4 py-3 text-right">Verification Action</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRecords.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400 italic">
                                No verification items match the selected filter.
                              </td>
                            </tr>
                          ) : (
                            filteredRecords.map((item) => (
                              <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                                <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[#4262ff]">
                                  {item.assetTag}
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-700 text-xs">{item.assetName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">Asset Status: {item.assetStatus}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">
                                  {item.departmentName || "—"}
                                </td>
                                <td className="px-4 py-3.5">
                                  <VerificationStatusBadge status={item.verificationStatus} />
                                </td>
                                <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">
                                  {item.verifierName || <span className="text-slate-400 italic">Unchecked</span>}
                                </td>
                                <td className="px-4 py-3.5 text-xs text-slate-500 font-medium max-w-[150px] truncate" title={item.remarks || ""}>
                                  {item.remarks || <span className="text-slate-300">—</span>}
                                </td>
                                {canVerify && (
                                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                    {item.verificationStatus === null ? (
                                      <div className="flex items-center justify-end gap-1.5">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 px-2 rounded-lg text-emerald-600 border-emerald-250 hover:bg-emerald-50/50 text-[10px] font-bold"
                                          onClick={() => {
                                            setVerifyingRecord(item);
                                            setVerificationStatus("VERIFIED");
                                            setVerificationRemarks("");
                                          }}
                                        >
                                          Intact
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 px-2 rounded-lg text-rose-600 border-rose-250 hover:bg-rose-50/50 text-[10px] font-bold"
                                          onClick={() => {
                                            setVerifyingRecord(item);
                                            setVerificationStatus("MISSING");
                                            setVerificationRemarks("");
                                          }}
                                        >
                                          Missing
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 px-2 rounded-lg text-amber-600 border-amber-250 hover:bg-amber-50/50 text-[10px] font-bold"
                                          onClick={() => {
                                            setVerifyingRecord(item);
                                            setVerificationStatus("DAMAGED");
                                            setVerificationRemarks("");
                                          }}
                                        >
                                          Damaged
                                        </Button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic">Verified</span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                {/* Discrepancy report */}
                {canManage && (
                  <TabsContent value="discrepancy" className="space-y-4 pt-4">
                    <div className="flex items-center justify-between bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
                      <div>
                        <h3 className="text-xs font-bold text-ink">Export Reconciliation Sheets</h3>
                        <p className="text-[10px] text-ink-subtle mt-0.5">Download current listing of missing or damaged assets.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-slate-700 flex items-center gap-1.5 text-xs font-bold"
                          onClick={handleExportCSV}
                        >
                          <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-slate-700 flex items-center gap-1.5 text-xs font-bold"
                          onClick={handleExportPDF}
                        >
                          <Printer className="h-4 w-4 text-[#4262ff]" /> Export PDF
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3 text-left">Asset Tag</th>
                            <th className="px-4 py-3 text-left">Asset Name</th>
                            <th className="px-4 py-3 text-left">Location</th>
                            <th className="px-4 py-3 text-left">Discrepancy Status</th>
                            <th className="px-4 py-3 text-left">Verifier</th>
                            <th className="px-4 py-3 text-left">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {!discrepancyData || (discrepancyData.missing.length === 0 && discrepancyData.damaged.length === 0) ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400 italic">
                                Zero discrepancies recorded. All checked assets are accounted for!
                              </td>
                            </tr>
                          ) : (
                            [...discrepancyData.missing, ...discrepancyData.damaged].map((item) => (
                              <tr key={item.record.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                                <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[#4262ff]">
                                  {item.assetTag}
                                </td>
                                <td className="px-4 py-3.5">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-700 text-xs">{item.assetName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">Status: {item.assetStatus}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-xs text-slate-500">
                                  {item.assetLocation || "—"}
                                </td>
                                <td className="px-4 py-3.5">
                                  <VerificationStatusBadge status={item.record.verificationStatus} />
                                </td>
                                <td className="px-4 py-3.5 text-xs text-slate-500 font-semibold">
                                  {item.verifierName || "System"}
                                </td>
                                <td className="px-4 py-3.5 text-xs text-slate-500 font-medium">
                                  {item.record.remarks || <span className="text-slate-350 italic">None</span>}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                )}
              </Tabs>

            </div>

            {/* Right Information panel */}
            <div className="space-y-6">
              {/* Cycle Info */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="h-4 w-4 text-[#4262ff]" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Audit Cycle Details</h2>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Start Date</span>
                    <p className="font-bold text-ink mt-0.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatSafeDate(audit.startDate)}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">End Date</span>
                    <p className="font-bold text-ink mt-0.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatSafeDate(audit.endDate)}
                    </p>
                  </div>

                  {audit.location && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Location Scope</span>
                      <p className="font-bold text-ink mt-0.5">{audit.location}</p>
                    </div>
                  )}

                  {audit.departmentName && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Department Scope</span>
                      <p className="font-bold text-ink mt-0.5">{audit.departmentName}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Created By</span>
                    <p className="font-bold text-ink mt-0.5 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {audit.creatorName || "System"}
                    </p>
                  </div>

                  {audit.closedBy && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Closed By</span>
                      <p className="font-bold text-ink mt-0.5 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {audit.closerName}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatSafeDate(audit.closedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Auditors */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#4262ff]" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Assigned Auditors</h2>
                  </div>
                  <span className="text-[10px] font-extrabold bg-[#4262ff]/8 text-[#4262ff] px-2 py-0.5 rounded-full">
                    {audit.auditors?.length || 0}
                  </span>
                </div>

                <div className="space-y-2">
                  {!audit.auditors || audit.auditors.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No auditors allocated.</p>
                  ) : (
                    audit.auditors.map((aud) => (
                      <div key={aud.id} className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                        <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center font-bold text-[#4262ff] border border-slate-100">
                          {aud.auditorName?.charAt(0) || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-700 truncate">{aud.auditorName}</p>
                          <p className="text-[9px] text-slate-400 truncate">{aud.auditorEmail}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Verification Remarks Confirm Modal */}
        {verifyingRecord && (
          <Dialog open={!!verifyingRecord} onOpenChange={(open) => !open && setVerifyingRecord(null)}>
            <DialogContent className="max-w-md bg-canvas">
              <DialogHeader>
                <div className="flex items-center gap-2 text-ink font-bold">
                  {verificationStatus === "VERIFIED" && <Check className="h-5 w-5 text-emerald-500" />}
                  {verificationStatus === "MISSING" && <XCircle className="h-5 w-5 text-rose-500" />}
                  {verificationStatus === "DAMAGED" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                  <DialogTitle className="text-lg">Verify Asset: {verifyingRecord.assetTag}</DialogTitle>
                </div>
                <DialogDescription className="text-sm text-ink-subtle">
                  Confirm physical state for <strong>{verifyingRecord.assetName}</strong>. 
                  Marking as <strong>{verificationStatus}</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-1.5 pt-2 flex flex-col">
                <Label htmlFor="verificationRemarks">Remarks (optional)</Label>
                <Textarea
                  id="verificationRemarks"
                  placeholder="Provide physical condition notes, location discrepancies, etc..."
                  value={verificationRemarks}
                  onChange={(e) => setVerificationRemarks(e.target.value)}
                  rows={3}
                />
              </div>

              <DialogFooter className="pt-4 flex gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setVerifyingRecord(null)}
                  disabled={isVerifyingMutating}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerifySubmit}
                  disabled={isVerifyingMutating}
                  className={`rounded-full text-white font-semibold ${
                    verificationStatus === "VERIFIED"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : verificationStatus === "MISSING"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-amber-600 hover:bg-amber-755"
                  }`}
                >
                  {isVerifyingMutating ? "Saving..." : "Confirm Verification"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Close Audit Confirmation Modal */}
        {isClosingConfirm && (
          <Dialog open={isClosingConfirm} onOpenChange={setIsClosingConfirm}>
            <DialogContent className="max-w-md bg-canvas">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <DialogTitle className="text-lg font-bold text-ink">Close Audit Cycle</DialogTitle>
                </div>
                <DialogDescription className="text-sm text-ink-subtle">
                  Are you sure you want to close this audit cycle? Closing will lock all verified records, 
                  and automatically mark any **MISSING** assets as **LOST** in the inventory directory.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="pt-4 flex gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsClosingConfirm(false)}
                  disabled={isTransitioning}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCloseAuditSubmit}
                  disabled={isTransitioning}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-755 text-white font-semibold"
                >
                  {isTransitioning ? "Closing Cycle..." : "Confirm Close"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Status transitions confirmation Modal (Cancel / Activate) */}
        {isStatusTransition && (
          <Dialog open={!!isStatusTransition} onOpenChange={(open) => !open && setIsStatusTransition(null)}>
            <DialogContent className="max-w-md bg-canvas">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {isStatusTransition === "ACTIVE" ? (
                    <Sparkles className="h-5 w-5 text-[#4262ff]" />
                  ) : (
                    <Ban className="h-5 w-5 text-rose-500" />
                  )}
                  <DialogTitle className="text-lg font-bold text-ink">
                    {isStatusTransition === "ACTIVE" ? "Start Audit Cycle" : "Cancel Audit Cycle"}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm text-ink-subtle">
                  {isStatusTransition === "ACTIVE"
                    ? "Activate verification sheets? Auditors will be authorized to start marking physical reconciliation records immediately."
                    : "Cancel this reconciliation cycle? Active sheets will be disabled and no further verifications allowed."}
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="pt-4 flex gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsStatusTransition(null)}
                  disabled={isTransitioning}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStatusTransitionSubmit}
                  disabled={isTransitioning}
                  className={`rounded-full text-white font-semibold ${
                    isStatusTransition === "CANCELLED"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-[#4262ff] hover:bg-[#3451e0]"
                  }`}
                >
                  {isTransitioning ? "Transitioning..." : "Confirm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </AppShell>
  );
};
