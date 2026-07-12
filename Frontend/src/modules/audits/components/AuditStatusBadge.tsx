import React from "react";
import type { AuditStatus } from "../types";

const STYLES: Record<AuditStatus, string> = {
  PLANNED: "text-amber-700 bg-amber-50/80 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30",
  ACTIVE: "text-blue-700 bg-blue-50/80 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30",
  COMPLETED: "text-emerald-700 bg-emerald-50/80 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30",
  CANCELLED: "text-rose-700 bg-rose-50/80 border-rose-200 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/30",
};

interface Props {
  status: AuditStatus;
  className?: string;
}

export const AuditStatusBadge: React.FC<Props> = ({ status, className = "" }) => {
  const label = status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STYLES[status] || ""} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
        status === "PLANNED" ? "bg-amber-500" :
        status === "ACTIVE" ? "bg-blue-500" :
        status === "COMPLETED" ? "bg-emerald-500" :
        "bg-rose-500"
      }`} />
      {label}
    </span>
  );
};
