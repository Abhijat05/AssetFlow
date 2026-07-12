import React, { useState } from "react";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { toast } from "sonner";
import {
  Bell,
  CheckCheck,
  Calendar,
  Wrench,
  ShieldCheck,
  UserCheck,
  ArrowRightLeft,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  RotateCcw,
  MailOpen,
} from "lucide-react";
import {
  useNotifications,
  useNotificationUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "../hooks/useActivity";
import { NotificationCard } from "../components/NotificationCard";
import type { Notification, NotificationType, NotificationPriority } from "../types";
import { cn } from "../../../lib/utils";
import { Link } from "react-router-dom";

const NOTIF_TYPES: { value: NotificationType; label: string }[] = [
  { value: "ASSET_ASSIGNED", label: "Asset Assigned" },
  { value: "ASSET_RETURNED", label: "Asset Returned" },
  { value: "TRANSFER_REQUEST", label: "Transfer Request" },
  { value: "TRANSFER_APPROVED", label: "Transfer Approved" },
  { value: "TRANSFER_REJECTED", label: "Transfer Rejected" },
  { value: "BOOKING_CREATED", label: "Booking Created" },
  { value: "BOOKING_CANCELLED", label: "Booking Cancelled" },
  { value: "BOOKING_REMINDER", label: "Booking Reminder" },
  { value: "BOOKING_COMPLETED", label: "Booking Completed" },
  { value: "MAINTENANCE_REQUEST", label: "Maintenance Request" },
  { value: "MAINTENANCE_APPROVED", label: "Maintenance Approved" },
  { value: "MAINTENANCE_REJECTED", label: "Maintenance Rejected" },
  { value: "MAINTENANCE_COMPLETED", label: "Maintenance Completed" },
  { value: "AUDIT_CREATED", label: "Audit Created" },
  { value: "AUDIT_ASSIGNED", label: "Audit Assigned" },
  { value: "AUDIT_COMPLETED", label: "Audit Completed" },
  { value: "AUDIT_DISCREPANCY", label: "Audit Discrepancy" },
  { value: "OVERDUE_RETURN", label: "Overdue Return" },
  { value: "SYSTEM", label: "System Notification" },
];

const NOTIF_PRIORITIES: { value: NotificationPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export const NotificationsPage: React.FC = () => {
  
  // ── 1. Filters state ────────────────────────────────────────────────────────
  const [filterType, setFilterType] = useState<NotificationType | undefined>(undefined);
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | undefined>(undefined);
  const [filterRead, setFilterRead] = useState<boolean | undefined>(undefined);
  const [filterDateFrom, setFilterDateFrom] = useState<string | undefined>(undefined);
  const [filterDateTo, setFilterDateTo] = useState<string | undefined>(undefined);
  
  // Selected notification for Detail Dialog
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  // Consolidated query
  const query = React.useMemo(() => {
    return {
      type: filterType,
      priority: filterPriority,
      isRead: filterRead,
      dateFrom: filterDateFrom,
      dateTo: filterDateTo,
      page: 1,
      limit: 100,
    };
  }, [filterType, filterPriority, filterRead, filterDateFrom, filterDateTo]);

  // ── 2. Queries & Polling ───────────────────────────────────────────────────
  const { data: notifications, isLoading } = useNotifications(query, 8000); // 8s polling
  const { data: unreadCount = 0 } = useNotificationUnreadCount(8000);

  // Mutations
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Notification marked as read");
      },
    });
  };

  const handleMarkAllRead = () => {
    if (unreadCount === 0) {
      toast.info("No unread notifications");
      return;
    }
    markAllReadMutation.mutate();
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSelectNotif = (notif: Notification) => {
    setSelectedNotif(notif);
    if (!notif.isRead) {
      handleMarkRead(notif.id);
    }
  };

  const handleResetFilters = () => {
    setFilterType(undefined);
    setFilterPriority(undefined);
    setFilterRead(undefined);
    setFilterDateFrom(undefined);
    setFilterDateTo(undefined);
  };

  // Icon mapping helper for modal
  const getTypeIcon = (type: NotificationType) => {
    const t = type.toUpperCase();
    if (t.includes("BOOKING")) return <Calendar className="h-5 w-5 text-emerald-500" />;
    if (t.includes("MAINTENANCE")) return <Wrench className="h-5 w-5 text-amber-500" />;
    if (t.includes("AUDIT")) return <ShieldCheck className="h-5 w-5 text-indigo-500" />;
    if (t.includes("ASSIGNED") || t.includes("RETURNED")) return <UserCheck className="h-5 w-5 text-blue-500" />;
    if (t.includes("TRANSFER")) return <ArrowRightLeft className="h-5 w-5 text-purple-500" />;
    if (t.includes("OVERDUE") || notifPriorityStyle(selectedNotif?.priority).includes("red")) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    return <Bell className="h-5 w-5 text-slate-500" />;
  };

  const notifPriorityStyle = (priority?: NotificationPriority) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-100";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-100";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const redirectUrl = (referenceType: string | null, referenceId: string | null) => {
    if (!referenceType || !referenceId) return null;
    const ref = referenceType.toLowerCase();
    if (ref === "asset") return `/assets/${referenceId}`;
    if (ref === "booking") return `/bookings/${referenceId}`;
    if (ref === "maintenance") return `/maintenance/${referenceId}`;
    if (ref === "audit") return `/audits/${referenceId}`;
    if (ref === "allocation") return `/allocations/${referenceId}`;
    return null;
  };

  const getReferenceLink = (notif: Notification) => {
    const url = redirectUrl(notif.referenceType, notif.referenceId);
    if (!url) return null;
    return (
      <Link
        to={url}
        onClick={() => setSelectedNotif(null)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue bg-brand-blue/5 border border-brand-blue/10 hover:bg-brand-blue/10 px-3.5 py-1.5 rounded-xl transition-all"
      >
        Go to Reference Resource
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    );
  };

  return (
    <AppShell>
      <div className="px-6 py-8 space-y-8 max-w-5xl mx-auto">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              <Bell className="h-3.5 w-3.5 text-brand-blue" />
              <span>Inbox & Messages</span>
            </div>
            <h1 className="text-2xl font-extrabold text-primary tracking-tight flex items-center gap-2.5">
              Notifications
              {unreadCount > 0 && (
                <span className="text-[11px] font-extrabold bg-brand-blue text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  {unreadCount} Unread
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500">
              Stay updated on allocation cycles, maintenance completions, booking requests, and audits.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handleMarkAllRead}
              variant="outline"
              size="sm"
              disabled={unreadCount === 0}
              className="h-9 text-xs rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 font-bold gap-1.5 shadow-sm bg-white"
            >
              <CheckCheck className="h-4 w-4 text-emerald-600" />
              Mark all as read
            </Button>
          </div>
        </div>

        {/* Collapsible Filter Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm animate-reveal">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Filter className="h-4 w-4 text-brand-blue" />
            <span>Search & Filter Inbox</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</label>
              <Select
                value={filterType || "all"}
                onValueChange={(val) => setFilterType(val === "all" ? undefined : (val as NotificationType))}
              >
                <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="all" className="text-xs font-semibold">All Types</SelectItem>
                  {NOTIF_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs font-medium">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</label>
              <Select
                value={filterPriority || "all"}
                onValueChange={(val) => setFilterPriority(val === "all" ? undefined : (val as NotificationPriority))}
              >
                <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs font-semibold">All Priorities</SelectItem>
                  {NOTIF_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value} className="text-xs font-medium">
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <Select
                value={filterRead === undefined ? "all" : String(filterRead)}
                onValueChange={(val) => {
                  if (val === "all") setFilterRead(undefined);
                  else setFilterRead(val === "true");
                }}
              >
                <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 bg-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs font-semibold">All Status</SelectItem>
                  <SelectItem value="false" className="text-xs font-medium">Unread Only</SelectItem>
                  <SelectItem value="true" className="text-xs font-medium">Read Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date From</label>
              <Input
                type="date"
                className="h-9 text-xs rounded-xl border-slate-200 bg-white"
                value={filterDateFrom || ""}
                onChange={(e) => setFilterDateFrom(e.target.value || undefined)}
              />
            </div>

            {/* Date To */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date To</label>
              <Input
                type="date"
                className="h-9 text-xs rounded-xl border-slate-200 bg-white"
                value={filterDateTo || ""}
                onChange={(e) => setFilterDateTo(e.target.value || undefined)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="h-8 text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-50 gap-1.5 text-slate-500 bg-white"
            >
              <RotateCcw className="h-3 w-3" />
              Reset filters
            </Button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="border-slate-200 rounded-2xl p-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-8 rounded-xl bg-slate-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-28 bg-slate-100" />
                        <Skeleton className="h-3 w-16 bg-slate-100" />
                      </div>
                      <Skeleton className="h-4 w-1/2 bg-slate-100" />
                      <Skeleton className="h-3.5 w-3/4 bg-slate-100" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <Card className="border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 bg-white animate-reveal">
              <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                <MailOpen className="h-5 w-5 text-slate-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-700">Inbox is empty</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  You don't have any notifications right now. Any updates relating to your assets, bookings, or organization will appear here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 animate-reveal">
              {notifications.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  notification={notif}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                  onSelect={handleSelectNotif}
                />
              ))}
            </div>
          )}
        </div>

        {/* Notification details Modal */}
        <Dialog open={!!selectedNotif} onOpenChange={(open) => !open && setSelectedNotif(null)}>
          {selectedNotif && (
            <DialogContent className="max-w-md rounded-2xl border-slate-200 p-6 animate-reveal">
              <DialogHeader className="space-y-3 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center border border-slate-100 bg-slate-50 shadow-sm shrink-0">
                      {getTypeIcon(selectedNotif.type)}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {selectedNotif.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[9px] font-bold border",
                    notifPriorityStyle(selectedNotif.priority)
                  )}>
                    {selectedNotif.priority} Priority
                  </span>
                </div>

                <DialogTitle className="text-sm font-bold text-primary tracking-tight leading-snug">
                  {selectedNotif.title}
                </DialogTitle>
                <div className="text-[10px] text-slate-400 font-bold">
                  Sent: {new Date(selectedNotif.createdAt).toLocaleString("en-IN")}
                </div>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {selectedNotif.message}
                </p>

                {/* Custom Metadata or Details if needed */}
                {(selectedNotif.referenceType || selectedNotif.referenceId) && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Associated Reference Resource
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-500">Resource:</span>{" "}
                        <span className="font-bold text-primary capitalize">
                          {selectedNotif.referenceType?.toLowerCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500">Reference ID:</span>{" "}
                        <span className="font-mono text-[10px] bg-white border border-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          {selectedNotif.referenceId?.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleDelete(selectedNotif.id);
                    setSelectedNotif(null);
                  }}
                  className="h-9 text-xs rounded-xl border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 font-bold w-full sm:w-auto"
                >
                  Delete notification
                </Button>
                
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {getReferenceLink(selectedNotif)}
                  <Button
                    onClick={() => setSelectedNotif(null)}
                    className="h-9 text-xs rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-4"
                  >
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </AppShell>
  );
};
export default NotificationsPage;
