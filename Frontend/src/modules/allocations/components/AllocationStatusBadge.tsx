import React from "react";
import type { AllocationStatus } from "../types";

const statusConfig: Record<AllocationStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-100/90 text-emerald-800 border-emerald-300",
  },
  RETURN_REQUESTED: {
    label: "Return Requested",
    className: "bg-amber-100/90 text-amber-800 border-amber-300",
  },
  RETURNED: {
    label: "Returned",
    className: "bg-slate-100 text-slate-700 border-slate-300",
  },
  OVERDUE: {
    label: "Overdue",
    className: "bg-red-100/90 text-red-800 border-red-300",
  },
  TRANSFER_PENDING: {
    label: "Transfer Pending",
    className: "bg-blue-100/90 text-blue-800 border-blue-300",
  },
  TRANSFERRED: {
    label: "Transferred",
    className: "bg-indigo-100/90 text-indigo-800 border-indigo-300",
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
