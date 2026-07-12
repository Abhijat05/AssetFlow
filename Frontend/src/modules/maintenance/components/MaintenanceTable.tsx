import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Eye, User, Calendar, AlertTriangle, Hammer } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { MaintenanceStatusBadge } from "./MaintenanceStatusBadge";
import { format } from "date-fns";
import type { MaintenanceRequest, MaintenancePriority } from "../types";

const colHelper = createColumnHelper<MaintenanceRequest>();

const formatSafeDate = (dateStr: string | null | undefined, template: string = "MMM d, yyyy") => {
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wider ${styles[priority]}`}>
      {priority}
    </span>
  );
};

interface Props {
  data: MaintenanceRequest[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
}

export const MaintenanceTable: React.FC<Props> = ({
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
  total,
}) => {
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<MaintenanceRequest, any>[] = useMemo(
    () => [
      colHelper.accessor("assetName", {
        header: "Asset",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-ink text-sm">{row.original.assetName || "—"}</span>
            <span className="font-mono text-[10px] text-brand-blue bg-brand-blue/8 px-1.5 py-0.5 rounded w-fit mt-0.5">
              {row.original.assetTag || "—"}
            </span>
          </div>
        ),
      }),
      colHelper.accessor("reporterName", {
        header: "Reported By",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-ink flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400" />
            {getValue() || "Shared User"}
          </span>
        ),
      }),
      colHelper.accessor("priority", {
        header: "Priority",
        cell: ({ getValue }) => <PriorityBadge priority={getValue() as MaintenancePriority} />,
      }),
      colHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => <MaintenanceStatusBadge status={getValue()} />,
      }),
      colHelper.accessor("technicianName", {
        header: "Assigned Technician",
        cell: ({ getValue }) => {
          const name = getValue();
          return name ? (
            <span className="text-sm font-medium text-ink flex items-center gap-1.5">
              <Hammer className="h-3.5 w-3.5 text-slate-400" />
              {name}
            </span>
          ) : (
            <span className="text-xs text-slate-400 italic">Unassigned</span>
          );
        },
      }),
      colHelper.accessor("createdAt", {
        header: "Created On",
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formatSafeDate(getValue() as string)}
          </span>
        ),
      }),
      colHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/maintenance/${row.original.id}`)}
            className="h-8 w-8 p-0 rounded-full hover:bg-brand-blue/8"
            title="View details"
          >
            <Eye className="h-4 w-4 text-slate-500" />
          </Button>
        ),
      }),
    ],
    [navigate]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-base font-semibold text-ink">No maintenance requests found</p>
        <p className="text-sm text-ink-subtle mt-1">Try adjusting your filters or report a new issue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-slate-100 bg-slate-50/80">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-subtle">
            Showing page {page} of {totalPages} · {total} total requests
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
