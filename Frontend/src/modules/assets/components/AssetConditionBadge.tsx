import React from "react";
import type { AssetCondition, AssetStatus } from "../types";

const conditionConfig: Record<AssetCondition, { label: string; className: string }> = {
  NEW:       { label: "New",       className: "bg-emerald-100/90 text-emerald-800 border-emerald-300" },
  EXCELLENT: { label: "Excellent", className: "bg-sky-100/90 text-sky-800 border-sky-300" },
  GOOD:      { label: "Good",      className: "bg-blue-100/90 text-blue-800 border-blue-300" },
  FAIR:      { label: "Fair",      className: "bg-amber-100/90 text-amber-800 border-amber-300" },
  POOR:      { label: "Poor",      className: "bg-orange-100/90 text-orange-800 border-orange-300" },
  DAMAGED:   { label: "Damaged",   className: "bg-red-100/90 text-red-800 border-red-300" },
};

const statusConfig: Record<AssetStatus, { label: string; className: string }> = {
  AVAILABLE:          { label: "Available",          className: "bg-emerald-100/90 text-emerald-800 border-emerald-300" },
  IN_USE:             { label: "In Use",             className: "bg-blue-100/90 text-blue-800 border-blue-300" },
  UNDER_MAINTENANCE:  { label: "Maintenance",        className: "bg-amber-100/90 text-amber-800 border-amber-300" },
  RETIRED:            { label: "Retired",            className: "bg-slate-100 text-slate-700 border-slate-300" },
  LOST:               { label: "Lost",               className: "bg-red-100/90 text-red-800 border-red-300" },
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
