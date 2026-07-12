import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Eye, ShieldAlert, Calendar, Users, Building, MapPin } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { Progress } from "../../../components/ui/progress";
import { AuditStatusBadge } from "./AuditStatusBadge";
import { format } from "date-fns";
import type { AuditCycle, AuditAssignment } from "../types";

// Helper row structure from paginated return
interface AuditRow {
  cycle: AuditCycle;
  creatorName?: string;
  departmentName?: string | null;
}

const colHelper = createColumnHelper<AuditRow>();

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

interface Props {
  data: AuditRow[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
}

export const AuditTable: React.FC<Props> = ({
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
  total,
}) => {
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<AuditRow, any>[] = useMemo(
    () => [
      colHelper.accessor("cycle.name", {
        header: "Audit Name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-ink text-sm">{row.original.cycle.name}</span>
            <span className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
              {row.original.cycle.description || "No description provided"}
            </span>
          </div>
        ),
      }),
      colHelper.accessor("cycle.scopeType", {
        header: "Scope",
        cell: ({ row }) => {
          const type = row.original.cycle.scopeType;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {type}
              </span>
              {type === "DEPARTMENT" && (
                <span className="text-xs text-ink-subtle flex items-center gap-1">
                  <Building className="h-3 w-3 text-slate-400" />
                  {row.original.departmentName || "Department"}
                </span>
              )}
              {type === "LOCATION" && (
                <span className="text-xs text-ink-subtle flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {row.original.cycle.location || "Location"}
                </span>
              )}
              {type === "ORGANIZATION" && (
                <span className="text-xs text-slate-400 italic">Entire Organization</span>
              )}
            </div>
          );
        },
      }),
      colHelper.accessor("cycle.startDate", {
        header: "Start Date",
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formatSafeDate(getValue() as string)}
          </span>
        ),
      }),
      colHelper.accessor("cycle.endDate", {
        header: "End Date",
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formatSafeDate(getValue() as string)}
          </span>
        ),
      }),
      colHelper.accessor("cycle.status", {
        header: "Status",
        cell: ({ getValue }) => <AuditStatusBadge status={getValue()} />,
      }),
      colHelper.accessor("cycle.auditors", {
        header: "Assigned Auditors",
        cell: ({ getValue }) => {
          const list = (getValue() || []) as AuditAssignment[];
          if (list.length === 0) return <span className="text-xs text-slate-400 italic">None</span>;
          return (
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-full bg-[#4262ff]/5 border border-[#4262ff]/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-3.5 w-3.5 text-[#4262ff]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                  {list.map((a) => a.auditorName).join(", ")}
                </span>
              </div>
            </div>
          );
        },
      }),
      colHelper.display({
        id: "progress",
        header: "Progress",
        cell: ({ row }) => {
          const stats = row.original.cycle.stats;
          if (!stats || stats.total === 0) {
            return <span className="text-xs text-slate-400 italic">No assets</span>;
          }
          const checked = stats.total - stats.unverified;
          const percent = Math.round((checked / stats.total) * 100);
          return (
            <div className="w-28 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>{percent}%</span>
                <span>{checked}/{stats.total} Verified</span>
              </div>
              <Progress value={percent} className="h-1.5" />
            </div>
          );
        },
      }),
      colHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/audits/${row.original.cycle.id}`)}
            className="h-8 w-8 p-0 rounded-full hover:bg-[#4262ff]/8"
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
          <ShieldAlert className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-base font-semibold text-ink">No audit cycles found</p>
        <p className="text-sm text-ink-subtle mt-1">Try adjusting your filters or initiate a new audit.</p>
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
            Showing page {page} of {totalPages} · {total} total cycles
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
