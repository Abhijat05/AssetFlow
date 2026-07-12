import React from "react";
import type { AssetCondition, AssetStatus } from "../types";

const conditionConfig: Record<AssetCondition, { label: string; className: string }> = {
  NEW:       { label: "New",       className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  EXCELLENT: { label: "Excellent", className: "bg-sky-50 text-sky-700 border-sky-200" },
  GOOD:      { label: "Good",      className: "bg-blue-50 text-blue-700 border-blue-200" },
  FAIR:      { label: "Fair",      className: "bg-amber-50 text-amber-700 border-amber-200" },
  POOR:      { label: "Poor",      className: "bg-orange-50 text-orange-700 border-orange-200" },
  DAMAGED:   { label: "Damaged",   className: "bg-red-50 text-red-700 border-red-200" },
};

const statusConfig: Record<AssetStatus, { label: string; className: string }> = {
  AVAILABLE:          { label: "Available",          className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  IN_USE:             { label: "In Use",             className: "bg-blue-50 text-blue-700 border-blue-200" },
  UNDER_MAINTENANCE:  { label: "Maintenance",        className: "bg-amber-50 text-amber-700 border-amber-200" },
  RETIRED:            { label: "Retired",            className: "bg-slate-100 text-slate-500 border-slate-200" },
  LOST:               { label: "Lost",               className: "bg-red-50 text-red-700 border-red-200" },
};

export const ConditionBadge: React.FC<{ condition: AssetCondition }> = ({ condition }) => {
  const cfg = conditionConfig[condition] ?? { label: condition, className: "bg-slate-50 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: AssetStatus }> = ({ status }) => {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-slate-50 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {cfg.label}
    </span>
  );
};
