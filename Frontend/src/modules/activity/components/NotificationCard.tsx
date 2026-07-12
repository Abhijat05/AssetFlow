import React from "react";
import type { Notification } from "../types";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Wrench,
  ShieldCheck,
  UserCheck,
  ArrowRightLeft,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "../../../lib/utils";

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (notification: Notification) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
  onDelete,
  onSelect,
}) => {
  const { id, title, message, type, priority, isRead, createdAt, referenceType, referenceId } = notification;

  // Format date-time
  const formattedTime = React.useMemo(() => {
    try {
      const date = new Date(createdAt);
      // eslint-disable-next-line react-hooks/purity
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  }, [createdAt]);

  // Determine Icon based on Notification Type
  const getTypeIcon = () => {
    const t = type.toUpperCase();
    if (t.includes("BOOKING")) return <Calendar className="h-4 w-4 text-emerald-500" />;
    if (t.includes("MAINTENANCE")) return <Wrench className="h-4 w-4 text-amber-500" />;
    if (t.includes("AUDIT")) return <ShieldCheck className="h-4 w-4 text-indigo-500" />;
    if (t.includes("ASSIGNED") || t.includes("RETURNED")) return <UserCheck className="h-4 w-4 text-blue-500" />;
    if (t.includes("TRANSFER")) return <ArrowRightLeft className="h-4 w-4 text-purple-500" />;
    if (t.includes("OVERDUE") || priority === "CRITICAL") return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <Bell className="h-4 w-4 text-slate-500" />;
  };

  // Determine Priority Color Badges
  const getPriorityStyle = () => {
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

  // Build redirect link
  const redirectUrl = React.useMemo(() => {
    if (!referenceType || !referenceId) return null;
    const ref = referenceType.toLowerCase();
    if (ref === "asset") return `/assets/${referenceId}`;
    if (ref === "booking") return `/bookings/${referenceId}`;
    if (ref === "maintenance") return `/maintenance/${referenceId}`;
    if (ref === "audit") return `/audits/${referenceId}`;
    if (ref === "allocation") return `/allocations/${referenceId}`;
    return null;
  }, [referenceType, referenceId]);

  return (
    <Card
      className={cn(
        "group border border-slate-200 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer",
        !isRead ? "bg-[#4262ff]/[0.02] border-[#4262ff]/20" : "bg-white"
      )}
      onClick={() => onSelect(notification)}
    >
      <CardContent className="p-4 flex gap-4">
        {/* Left Side Icon and Pulse Dot */}
        <div className="relative shrink-0 flex items-start mt-1">
          <div className={cn(
            "h-8 w-8 rounded-xl flex items-center justify-center border border-slate-100 bg-white shadow-sm"
          )}>
            {getTypeIcon()}
          </div>
          {!isRead && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4262ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4262ff]"></span>
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
              {type.replace(/_/g, " ")}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[8px] font-bold border",
                getPriorityStyle()
              )}>
                {priority}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{formattedTime}</span>
            </div>
          </div>

          <h3 className={cn(
            "text-xs font-bold truncate text-[#050038]",
            !isRead ? "text-[#050038]" : "text-slate-700"
          )}>
            {title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {message}
          </p>

          {/* Reference Links & Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100/50 mt-2" onClick={(e) => e.stopPropagation()}>
            <div>
              {redirectUrl ? (
                <Link
                  to={redirectUrl}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4262ff] hover:underline"
                >
                  View Details
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-[10px] text-slate-400 italic">No reference details</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {!isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkRead(id)}
                  className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                  title="Mark as Read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id)}
                className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                title="Delete Notification"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default NotificationCard;
