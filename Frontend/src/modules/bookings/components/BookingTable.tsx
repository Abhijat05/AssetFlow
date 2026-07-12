import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Ban, User, Calendar } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { BookingStatusBadge } from "./BookingStatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { format } from "date-fns";
import type { Booking } from "../types";

const colHelper = createColumnHelper<Booking>();

const formatSafeDate = (dateStr: string | null | undefined, template: string = "MMM d, yyyy · h:mm a") => {
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
  data: Booking[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
  userRole: string;
  currentUserId: string;
  onEdit: (booking: Booking) => void;
  onCancel: (booking: Booking, reason: string) => Promise<void>;
}

export const BookingTable: React.FC<Props> = ({
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
  total,
  userRole,
  currentUserId,
  onEdit,
  onCancel,
}) => {
  const navigate = useNavigate();
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const isAdminOrManagerOrDeptHead = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"].includes(userRole);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<Booking, any>[] = useMemo(
    () => [
      colHelper.accessor("resource", {
        header: "Resource",
        cell: ({ getValue }) => {
          const res = getValue() as Booking["resource"];
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-ink text-sm">{res?.name ?? "—"}</span>
              <span className="font-mono text-[10px] text-brand-blue bg-brand-blue/8 px-1.5 py-0.5 rounded w-fit mt-0.5">
                {res?.assetTag ?? "—"}
              </span>
            </div>
          );
        },
      }),
      colHelper.accessor("user", {
        header: "Booked By",
        cell: ({ getValue }) => {
          const usr = getValue() as Booking["user"];
          return (
            <div className="flex items-center gap-1.5 text-sm text-ink-subtle">
              <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-ink truncate">{usr?.name ?? "—"}</span>
                <span className="text-xs text-slate-400 truncate">{usr?.email ?? ""}</span>
              </div>
            </div>
          );
        },
      }),
      colHelper.accessor("department", {
        header: "Department",
        cell: ({ getValue }) => {
          const dept = getValue() as Booking["department"];
          return <span className="text-sm text-ink-subtle">{dept?.name ?? "—"}</span>;
        },
      }),
      colHelper.accessor("startTime", {
        header: "Start Time",
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formatSafeDate(getValue() as string)}
          </span>
        ),
      }),
      colHelper.accessor("endTime", {
        header: "End Time",
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formatSafeDate(getValue() as string)}
          </span>
        ),
      }),
      colHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => <BookingStatusBadge status={getValue()} />,
      }),
      colHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const b = row.original;
          const isOwner = b.bookedBy === currentUserId;
          const canModify = isAdminOrManagerOrDeptHead || isOwner;
          const isUpcoming = b.status === "UPCOMING";

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/bookings/${b.id}`)}
                className="h-8 w-8 p-0 rounded-full hover:bg-brand-blue/8"
                title="View details"
              >
                <Eye className="h-4 w-4 text-slate-500" />
              </Button>
              {canModify && isUpcoming && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(b)}
                    className="h-8 w-8 p-0 rounded-full hover:bg-amber-500/8"
                    title="Edit booking"
                  >
                    <Pencil className="h-4 w-4 text-amber-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCancelTarget(b);
                      setCancelReason("");
                    }}
                    className="h-8 w-8 p-0 rounded-full hover:bg-rose-500/8"
                    title="Cancel booking"
                  >
                    <Ban className="h-4 w-4 text-rose-500" />
                  </Button>
                </>
              )}
            </div>
          );
        },
      }),
    ],
    [navigate, currentUserId, isAdminOrManagerOrDeptHead, onEdit]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setIsCancelling(true);
      await onCancel(cancelTarget, cancelReason);
      setCancelTarget(null);
    } finally {
      setIsCancelling(false);
    }
  };

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
          <Calendar className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-base font-semibold text-ink">No bookings found</p>
        <p className="text-sm text-ink-subtle mt-1">Try adjusting your filters or request a new booking.</p>
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
            Showing page {page} of {totalPages} · {total} total bookings
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

      {/* Cancellation Reason Modal */}
      {cancelTarget && (
        <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
          <DialogContent className="max-w-md bg-canvas">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-ink">Cancel Reservation</DialogTitle>
              <DialogDescription className="text-sm text-ink-subtle">
                Are you sure you want to cancel the booking &ldquo;{cancelTarget.title}&rdquo; for resource {cancelTarget.resource?.name}?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5 pt-2 flex flex-col">
              <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Provide a brief explanation for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter className="pt-4 flex gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setCancelTarget(null)}
                disabled={isCancelling}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                {isCancelling ? "Processing..." : "Confirm Cancellation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
