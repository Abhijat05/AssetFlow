import React from "react";
import type { AuditStatus } from "../types";

const STYLES: Record<AuditStatus, string> = {
  PLANNED: "text-amber-800 bg-amber-100/90 border-amber-300 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30",
  ACTIVE: "text-blue-800 bg-blue-100/90 border-blue-300 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30",
  COMPLETED: "text-emerald-800 bg-emerald-100/90 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30",
  CANCELLED: "text-rose-800 bg-rose-100/90 border-rose-300 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/30",
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
