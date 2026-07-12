import React from "react";
import type { MaintenanceStatus } from "../types";

const STYLES: Record<MaintenanceStatus, string> = {
  PENDING: "text-amber-800 bg-amber-100/90 border-amber-300 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30",
  APPROVED: "text-indigo-800 bg-indigo-100/90 border-indigo-300 dark:text-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-900/30",
  REJECTED: "text-rose-800 bg-rose-100/90 border-rose-300 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/30",
  TECHNICIAN_ASSIGNED: "text-purple-800 bg-purple-100/90 border-purple-300 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-900/30",
  IN_PROGRESS: "text-blue-800 bg-blue-100/90 border-blue-300 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30",
  RESOLVED: "text-emerald-800 bg-emerald-100/90 border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30",
};

const LABELS: Record<MaintenanceStatus, string> = {
  PENDING: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  TECHNICIAN_ASSIGNED: "Technician Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

interface Props {
  status: MaintenanceStatus;
  className?: string;
}

export const MaintenanceStatusBadge: React.FC<Props> = ({ status, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STYLES[status] || ""} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
        status === "PENDING" ? "bg-amber-500" :
        status === "APPROVED" ? "bg-indigo-500" :
        status === "REJECTED" ? "bg-rose-500" :
        status === "TECHNICIAN_ASSIGNED" ? "bg-purple-500" :
        status === "IN_PROGRESS" ? "bg-blue-500" :
        "bg-emerald-500"
      }`} />
      {LABELS[status] || status}
    </span>
  );
};
