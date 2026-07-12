import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import {
  useBooking,
  useBookingHistory,
  useCancelBooking,
} from "../hooks/useBookings";
import { BookingStatusBadge } from "../components/BookingStatusBadge";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { Separator } from "../../../components/ui/separator";
import { CreateBookingDialog } from "../components/CreateBookingDialog";
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
import {
  ArrowLeft,
  Calendar,
  User,
  Building,
  Clock,
  Ban,
  Pencil,
  AlertCircle,
  Package,
  History,
  Tag,
  Hash,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";

const formatSafeDate = (dateStr: string | null | undefined, template: string = "MMMM d, yyyy · h:mm a") => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return format(d, template);
  } catch {
    return "—";
  }
};

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <div className="text-sm font-semibold text-ink mt-0.5 break-words">{value ?? "—"}</div>
    </div>
  </div>
);

export const BookingDetail: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role || "EMPLOYEE";
  const currentUserId = user?.id || "";

  // Queries
  const { data: booking, isLoading, isError } = useBooking(id);
  const { data: history = [], isLoading: isLoadingHistory } = useBookingHistory(id);

  // Mutations
  const cancelMutation = useCancelBooking();

  // Dialog states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const isAdminOrManagerOrDeptHead = ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"].includes(userRole);

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-screen-lg mx-auto px-6 py-8 space-y-6">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (isError || !booking) {
    return (
      <AppShell>
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-lg font-semibold text-ink">Booking not found</p>
            <Button variant="outline" className="rounded-full" onClick={() => navigate("/bookings")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Bookings
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const isOwner = booking.bookedBy === currentUserId;
  const canModify = isAdminOrManagerOrDeptHead || isOwner;
  const isUpcoming = booking.status === "UPCOMING";

  const handleConfirmCancel = async () => {
    try {
      setIsCancelling(true);
      await cancelMutation.mutateAsync({ id: booking.id, reason: cancelReason });
      setIsCancelOpen(false);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-canvas">
        {/* Header bar */}
        <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="max-w-screen-lg mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
                onClick={() => navigate("/bookings")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-5" />
              <div>
                <h1 className="text-sm font-bold text-ink truncate max-w-[200px] sm:max-w-xs">
                  {booking.title}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono">ID: {booking.id.slice(0, 8)}</span>
                  <BookingStatusBadge status={booking.status} />
                </div>
              </div>
            </div>

            {canModify && isUpcoming && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-slate-600 border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 flex items-center gap-1.5"
                  onClick={() => {
                    setCancelReason("");
                    setIsCancelOpen(true);
                  }}
                >
                  <Ban className="h-3.5 w-3.5" /> Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="max-w-screen-lg mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Columns - Booking details & timeline */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Booking Info Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-blue" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Reservation Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InfoRow
                    icon={<User className="h-4 w-4 text-slate-400" />}
                    label="Reserved By"
                    value={`${booking.user?.name} (${booking.user?.email})`}
                  />
                  <InfoRow
                    icon={<Building className="h-4 w-4 text-slate-400" />}
                    label="Charging Department"
                    value={booking.department?.name || "—"}
                  />
                  <InfoRow
                    icon={<Clock className="h-4 w-4 text-slate-400" />}
                    label="Reservation Start"
                    value={formatSafeDate(booking.startTime)}
                  />
                  <InfoRow
                    icon={<Clock className="h-4 w-4 text-slate-400" />}
                    label="Reservation End"
                    value={formatSafeDate(booking.endTime)}
                  />
                </div>

                {booking.purpose && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">Purpose / Details</p>
                      <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{booking.purpose}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Cancellation Reason details if cancelled */}
              {booking.status === "CANCELLED" && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-rose-800">
                    <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                    <h2 className="text-sm font-bold uppercase tracking-wide">Cancellation Details</h2>
                  </div>
                  <div className="space-y-2 text-sm text-rose-950">
                    <p>
                      This reservation was cancelled on{" "}
                      <span className="font-semibold">{formatSafeDate(booking.updatedAt)}</span>.
                    </p>
                    {booking.cancelReason && (
                      <div className="bg-white border border-rose-100 rounded-xl p-3.5 text-xs text-rose-900 mt-2 italic leading-relaxed">
                        &ldquo;{booking.cancelReason}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline Flow */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-blue" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Timeline Flow</h2>
                </div>

                <div className="flex items-center justify-between max-w-md mx-auto pt-4 pb-2">
                  {/* Step 1: Created */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-250">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1">Created</span>
                  </div>

                  <div className="h-[2px] bg-slate-200 flex-1 -mt-4" />

                  {/* Step 2: Upcoming / Ongoing */}
                  <div className="flex flex-col items-center flex-1">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                      booking.status === "ONGOING" || booking.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-250"
                        : booking.status === "UPCOMING"
                        ? "bg-blue-100 text-blue-700 border-blue-250"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                    }`}>
                      {booking.status === "ONGOING" ? (
                        <Clock className="h-4 w-4 animate-pulse" />
                      ) : booking.status === "COMPLETED" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        "2"
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1">Ongoing</span>
                  </div>

                  <div className="h-[2px] bg-slate-200 flex-1 -mt-4" />

                  {/* Step 3: Completed */}
                  <div className="flex flex-col items-center flex-1">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                      booking.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-250"
                        : booking.status === "CANCELLED"
                        ? "bg-rose-100 text-rose-700 border-rose-250"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                    }`}>
                      {booking.status === "CANCELLED" ? <Ban className="h-4 w-4" /> : "3"}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1">
                      {booking.status === "CANCELLED" ? "Cancelled" : "Completed"}
                    </span>
                  </div>
                </div>
              </div>

              {/* History Audit Log */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-brand-blue" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">History Log</h2>
                </div>

                {isLoadingHistory ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center text-slate-400">
                    <History className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm font-medium">No timeline audit logs found.</p>
                  </div>
                ) : (
                  <ol className="relative border-l border-slate-200 space-y-6 ml-3">
                    {history.map((entry) => (
                      <li key={entry.id} className="ml-6">
                        <span className="absolute -left-[9px] h-4 w-4 rounded-full border-2 border-white bg-brand-blue flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        </span>
                        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-brand-blue uppercase tracking-wide">
                              {entry.action.replace("BOOKING_", "")}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatSafeDate(entry.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-ink">{entry.description}</p>
                          <p className="text-xs text-slate-400 mt-1">by {entry.performedByName}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

            </div>

            {/* Right Column - Resource Info */}
            <div className="space-y-6">
              
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 h-fit">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-brand-blue" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Resource Info</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-ink">{booking.resource?.name}</h3>
                    <span className="font-mono text-xs font-semibold text-brand-blue bg-brand-blue/8 px-2 py-0.5 rounded-md mt-1.5 inline-block">
                      {booking.resource?.assetTag}
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-3.5">
                    <div className="flex items-start gap-2.5 text-sm">
                      <Tag className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Classification</p>
                        <p className="font-semibold text-ink mt-0.5">Shared Bookable Resource</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2.5 text-sm">
                      <ShieldCheck className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Policy Enforcement</p>
                        <p className="font-semibold text-ink mt-0.5">Overlapping bookings prevented</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-sm">
                      <Hash className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Asset ID</p>
                        <p className="font-mono text-xs text-ink mt-0.5 truncate">{booking.resource?.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Dialog Modulators */}
        {isEditOpen && (
          <CreateBookingDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            booking={booking}
          />
        )}

        {isCancelOpen && (
          <Dialog open={isCancelOpen} onOpenChange={(open) => !open && setIsCancelOpen(false)}>
            <DialogContent className="max-w-md bg-canvas">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-ink">Cancel Booking</DialogTitle>
                <DialogDescription className="text-sm text-ink-subtle">
                  Are you sure you want to cancel the booking &ldquo;{booking.title}&rdquo;?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-1.5 pt-2 flex flex-col">
                <Label htmlFor="cancel-reason-detail">Reason for Cancellation</Label>
                <Textarea
                  id="cancel-reason-detail"
                  placeholder="Explain the reason for cancelling this reservation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                />
              </div>
              <DialogFooter className="pt-4 flex gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsCancelOpen(false)}
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
    </AppShell>
  );
};
