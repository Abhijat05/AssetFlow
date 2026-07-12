import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import type { ColumnDef, HeaderGroup, Row, Cell, Header } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Eye, Package, Calendar, User, ArrowRightLeft, Reply } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { AllocationStatusBadge } from "./AllocationStatusBadge";
import type { Allocation } from "../types";
import { format } from "date-fns";

const colHelper = createColumnHelper<Allocation>();

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
  data: Allocation[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
  onReturnRequest: (allocation: Allocation) => void;
  onTransferRequest: (allocation: Allocation) => void;
  onCompleteReturn: (allocation: Allocation) => void;
  userRole: string;
  currentUserId: string;
}

export const AllocationTable: React.FC<Props> = ({
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
  total,
  onReturnRequest,
  onTransferRequest,
  onCompleteReturn,
  userRole,
  currentUserId,
}) => {
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<Allocation, any>[] = useMemo(
    () => [
      colHelper.accessor("asset.assetTag", {
        header: "Asset Tag",
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-md">
            {row.original.asset?.assetTag ?? "—"}
          </span>
        ),
      }),
      colHelper.accessor("asset.name", {
        header: "Asset Name",
        cell: ({ row }) => <span className="font-medium text-ink text-sm">{row.original.asset?.name ?? "—"}</span>,
      }),
      colHelper.accessor("employee", {
        header: "Employee",
        cell: ({ getValue }) => {
          const emp = getValue() as Allocation["employee"];
          return emp ? (
            <span className="text-sm text-ink-subtle flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              {emp.name}
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Shared Resource</span>
          );
        },
      }),
      colHelper.accessor("department", {
        header: "Department",
        cell: ({ getValue }) => {
          const dept = getValue() as Allocation["department"];
          return <span className="text-sm text-ink-subtle">{dept?.name ?? "—"}</span>;
        },
      }),
      colHelper.accessor("allocatedAt", {
        header: "Allocated On",
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-400" />
            {formatSafeDate(getValue() as string)}
          </span>
        ),
      }),
      colHelper.accessor("expectedReturnDate", {
        header: "Expected Return",
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? (
            <span className="text-xs text-slate-500">
              {formatSafeDate(val)}
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Permanent</span>
          );
        },
      }),
      colHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => <AllocationStatusBadge status={getValue()} />,
      }),
      colHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const allocation = row.original;
          const isCurrentHolder = allocation.employeeId === currentUserId;
          const isAdminOrManager = ["ADMIN", "ASSET_MANAGER"].includes(userRole);
          const allocationId = allocation.id && allocation.id !== "undefined" && allocation.id !== "null" ? allocation.id : "";

          return (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => allocationId && navigate(`/allocations/${allocationId}`)}
                disabled={!allocationId}
                className="h-8 w-8 p-0 rounded-full hover:bg-brand-blue/10"
                title="View details"
              >
                <Eye className="h-4 w-4 text-slate-500" />
              </Button>

              {/* Employee Quick Requests */}
              {isCurrentHolder && allocation.status === "ACTIVE" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReturnRequest(allocation)}
                    className="h-8 w-8 p-0 rounded-full hover:bg-amber-50 text-amber-600"
                    title="Request Return"
                  >
                    <Reply className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTransferRequest(allocation)}
                    className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 text-blue-600"
                    title="Request Transfer"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Manager Complete Actions */}
              {isAdminOrManager && allocation.status === "RETURN_REQUESTED" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCompleteReturn(allocation)}
                  className="h-8 w-8 p-0 rounded-full hover:bg-emerald-50 text-emerald-600"
                  title="Approve & Complete Return"
                >
                  <Reply className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [navigate, currentUserId, userRole, onReturnRequest, onTransferRequest, onCompleteReturn]
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
          <Package className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-base font-semibold text-ink">No allocations found</p>
        <p className="text-sm text-ink-subtle mt-1">Try adjusting search query or filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg: HeaderGroup<Allocation>) => (
                <tr key={hg.id} className="border-b border-slate-100 bg-slate-50/80">
                  {hg.headers.map((header: Header<Allocation, unknown>) => (
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
              {table.getRowModel().rows.map((row: Row<Allocation>) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                >
                  {row.getVisibleCells().map((cell: Cell<Allocation, unknown>) => (
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
            Page {page} of {totalPages} · {total} total allocations
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
