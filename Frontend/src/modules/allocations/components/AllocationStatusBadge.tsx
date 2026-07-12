import React from "react";
import type { AllocationStatus } from "../types";

const statusConfig: Record<AllocationStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  RETURN_REQUESTED: {
    label: "Return Requested",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  RETURNED: {
    label: "Returned",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  OVERDUE: {
    label: "Overdue",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  TRANSFER_PENDING: {
    label: "Transfer Pending",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  TRANSFERRED: {
    label: "Transferred",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
};

export const AllocationStatusBadge: React.FC<{ status: AllocationStatus }> = ({ status }) => {
  const cfg = statusConfig[status] ?? {
    label: status,
    className: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {cfg.label}
    </span>
  );
};
