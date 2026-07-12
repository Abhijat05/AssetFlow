import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAsset, useAssetHistory } from "../hooks/useAssets";
import { ConditionBadge, StatusBadge } from "../components/AssetConditionBadge";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { Separator } from "../../../components/ui/separator";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import {
  ArrowLeft,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  Hash,
  Building2,
  Tag,
  BookOpen,
  FileText,
  Clock,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

// ─── QR Code (inline SVG generator using simple matrix pattern) ────────────────
// We use a simple deterministic hash to produce a QR-like data matrix visual
// for display purposes. In production you'd use a real QR library.
const SimpleQR: React.FC<{ value: string }> = ({ value }) => {
  // Deterministic grid from string hash
  const size = 13;
  const grid: boolean[][] = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let c = 0; c < size; c++) {
      const seed = (hash ^ ((r * 31 + c) * 1234567)) | 0;
      grid[r][c] = Math.abs(seed) % 3 !== 0;
    }
  }
  // Force finder patterns (top-left, top-right, bottom-left corners)
  const fp = [[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]];
  fp.forEach(([r, c]) => { grid[r][c] = true; });
  fp.forEach(([r, c]) => { grid[r][size - 1 - c] = true; });
  fp.forEach(([r, c]) => { grid[size - 1 - r][c] = true; });
  const cellSize = 5;
  const svgSize = size * cellSize + 16;

  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-lg"
    >
      <rect width={svgSize} height={svgSize} fill="white" rx="4" />
      {grid.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize + 8}
              y={r * cellSize + 8}
              width={cellSize - 1}
              height={cellSize - 1}
              fill="#050038"
              rx="0.5"
            />
          ) : null
        )
      )}
    </svg>
  );
};

// ─── Info Row Helper ───────────────────────────────────────────────────────────
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

// ─── History Timeline ──────────────────────────────────────────────────────────
const HistoryTimeline: React.FC<{ assetId: string }> = ({ assetId }) => {
  const { data: history = [], isLoading } = useAssetHistory(assetId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center text-slate-400">
        <Clock className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm font-medium">No history recorded yet.</p>
      </div>
    );
  }

  return (
    <ol className="relative border-l border-slate-200 space-y-6 ml-3">
      {history.map((entry) => (
        <li key={entry.id} className="ml-6">
          <span className="absolute -left-[9px] h-4 w-4 rounded-full border-2 border-white bg-brand-blue flex items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wide">{entry.action}</span>
              <span className="text-xs text-slate-400">
                {format(new Date(entry.createdAt), "MMM d, yyyy · h:mm a")}
              </span>
            </div>
            <p className="text-sm text-ink">{entry.description}</p>
            <p className="text-xs text-slate-400 mt-1">by {entry.performedByName}</p>
          </div>
        </li>
      ))}
    </ol>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const AssetDetail: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: asset, isLoading, isError } = useAsset(id);

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-screen-lg mx-auto px-6 py-8 space-y-6">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (isError || !asset) {
    return (
      <AppShell>
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-lg font-semibold text-ink">Asset not found</p>
            <Button variant="outline" className="rounded-full" onClick={() => navigate("/assets")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const formatCurrency = (amount: number | null) =>
    amount != null
      ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
      : null;

  return (
    <AppShell>
      <div className="min-h-screen bg-canvas">
      {/* Topbar */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-screen-lg mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/assets")}
              className="rounded-full text-slate-600 h-9 gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-base font-bold text-ink leading-tight">{asset.name}</h1>
              <span className="font-mono text-xs text-brand-blue font-semibold">{asset.assetTag}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ConditionBadge condition={asset.condition} />
            <StatusBadge status={asset.status} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-screen-lg mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Main Info */}
          <div className="lg:col-span-2 space-y-5">

            {/* Photo */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {asset.photoUrl ? (
                <img
                  src={asset.photoUrl}
                  alt={asset.name}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Package className="h-10 w-10 opacity-30" />
                  <span className="text-sm">No photo available</span>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Basic Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoRow
                  icon={<Tag className="h-4 w-4 text-slate-400" />}
                  label="Asset Tag"
                  value={<span className="font-mono text-brand-blue">{asset.assetTag}</span>}
                />
                <InfoRow
                  icon={<Package className="h-4 w-4 text-slate-400" />}
                  label="Category"
                  value={asset.category?.name}
                />
                <InfoRow
                  icon={<Building2 className="h-4 w-4 text-slate-400" />}
                  label="Department"
                  value={asset.department?.name ?? "—"}
                />
                <InfoRow
                  icon={<Hash className="h-4 w-4 text-slate-400" />}
                  label="Serial Number"
                  value={asset.serialNumber ?? "—"}
                />
                <InfoRow
                  icon={<MapPin className="h-4 w-4 text-slate-400" />}
                  label="Current Location"
                  value={asset.currentLocation ?? "—"}
                />
                <InfoRow
                  icon={<BookOpen className="h-4 w-4 text-slate-400" />}
                  label="Bookable"
                  value={asset.isBookable ? "Yes — available for booking" : "No"}
                />
              </div>
              {asset.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1.5">Description</p>
                    <p className="text-sm text-ink leading-relaxed">{asset.description}</p>
                  </div>
                </>
              )}
            </div>

            {/* Acquisition Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Acquisition Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoRow
                  icon={<Calendar className="h-4 w-4 text-slate-400" />}
                  label="Acquisition Date"
                  value={asset.acquisitionDate ? format(new Date(asset.acquisitionDate), "MMMM d, yyyy") : "—"}
                />
                <InfoRow
                  icon={<DollarSign className="h-4 w-4 text-slate-400" />}
                  label="Acquisition Cost"
                  value={formatCurrency(asset.acquisitionCost) ?? "—"}
                />
                <InfoRow
                  icon={<Clock className="h-4 w-4 text-slate-400" />}
                  label="Registered On"
                  value={format(new Date(asset.createdAt), "MMMM d, yyyy")}
                />
              </div>
            </div>

            {/* Supporting Documents */}
            {asset.documents && asset.documents.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Supporting Documents</h2>
                <ul className="space-y-2">
                  {asset.documents.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-brand-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{doc.fileName}</p>
                        <p className="text-xs text-slate-400">
                          {(doc.fileSize / 1024).toFixed(1)} KB · {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
                        title="Open document"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* History Timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">History Timeline</h2>
              <HistoryTimeline assetId={id} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">

            {/* QR Code */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center gap-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 self-start">QR Code</h2>
              <div className="p-3 rounded-2xl border border-slate-200 bg-white shadow-inner">
                <SimpleQR value={asset.assetTag} />
              </div>
              <div className="text-center">
                <p className="font-mono text-sm font-bold text-ink">{asset.assetTag}</p>
                <p className="text-xs text-slate-400 mt-0.5">Scan to pull asset record</p>
              </div>
            </div>

            {/* Current Status */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Current Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Operational Status</span>
                  <StatusBadge status={asset.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Condition</span>
                  <ConditionBadge condition={asset.condition} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Bookable</span>
                  <span className={`text-sm font-semibold ${asset.isBookable ? "text-emerald-600" : "text-slate-400"}`}>
                    {asset.isBookable ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Meta */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Record Info</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Last updated</span>
                  <span className="font-medium text-ink text-right">
                    {format(new Date(asset.updatedAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Asset ID</span>
                  <span className="font-mono text-xs text-slate-400 truncate max-w-[120px]" title={asset.id}>
                    {asset.id.slice(0, 8)}…
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AppShell>
  );
};
