import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import {
  PlusCircle,
  UserCheck,
  RotateCcw,
  Wrench,
  ShieldCheck,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import type { DashboardActivity } from "../types";

interface RecentActivityProps {
  activity: DashboardActivity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activity }) => {
  // Format action text and return matching icon
  const getActionDetails = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE") || act.includes("REGISTER")) {
      return {
        label: "Registered Asset",
        icon: <PlusCircle className="h-3.5 w-3.5 text-emerald-600" />,
        bg: "bg-emerald-50 border border-emerald-100",
      };
    }
    if (act.includes("ALLOCATE") || act.includes("ASSIGN")) {
      return {
        label: "Allocated Asset",
        icon: <UserCheck className="h-3.5 w-3.5 text-brand-blue" />,
        bg: "bg-brand-blue/10 border border-brand-blue/10",
      };
    }
    if (act.includes("DEALLOCATE") || act.includes("RETURN")) {
      return {
        label: "Returned Asset",
        icon: <RotateCcw className="h-3.5 w-3.5 text-indigo-600" />,
        bg: "bg-indigo-50 border border-indigo-100",
      };
    }
    if (act.includes("MAINTENANCE") || act.includes("REPAIR") || act.includes("SERVICE")) {
      return {
        label: "Maintenance Request",
        icon: <Wrench className="h-3.5 w-3.5 text-amber-600" />,
        bg: "bg-amber-50 border border-amber-100",
      };
    }
    if (act.includes("AUDIT") || act.includes("VERIFY") || act.includes("RECONCILE")) {
      return {
        label: "Audited Asset",
        icon: <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />,
        bg: "bg-purple-50 border border-purple-100",
      };
    }
    if (act.includes("UPDATE") || act.includes("EDIT")) {
      return {
        label: "Updated Asset",
        icon: <FileText className="h-3.5 w-3.5 text-slate-500" />,
        bg: "bg-slate-50 border border-slate-100",
      };
    }
    return {
      label: action.replace(/_/g, " "),
      icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
      bg: "bg-amber-50 border border-amber-100",
    };
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      // If today, show e.g. "2 hours ago" or time, else show short date
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
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white h-full flex flex-col">
      <CardHeader className="p-5 border-b border-slate-100 flex-shrink-0">
        <CardTitle className="text-sm font-bold text-primary">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 min-h-0 overflow-y-auto">
        {activity.length === 0 ? (
          <div className="flex h-full min-h-[160px] flex-col items-center justify-center text-center p-4">
            <p className="text-sm text-slate-400 font-medium">No activity log found.</p>
            <p className="text-xs text-slate-400 mt-1 leading-normal">
              System changes and logs will appear here.
            </p>
          </div>
        ) : (
          <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-5">
            {activity.map((item, index) => {
              const details = getActionDetails(item.action);
              return (
                <div key={item.id || index} className="relative group">
                  {/* Timeline dot */}
                  <span
                    className={cn(
                      "absolute -left-[25px] top-0 h-4 w-4 rounded-full flex items-center justify-center bg-white shadow-sm z-10 transition-transform group-hover:scale-110",
                      details.bg
                    )}
                  >
                    <span className="scale-75 flex items-center justify-center">
                      {details.icon}
                    </span>
                  </span>

                  {/* Activity Details */}
                  <div className="text-xs space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-700 capitalize">
                        {item.performedByName || "System"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>

                    <div className="text-slate-500 font-medium leading-relaxed">
                      <span className="text-brand-blue font-semibold">{details.label}</span>
                      {item.assetId && item.assetName ? (
                        <>
                          {" for "}
                          <Link
                            to={`/assets/${item.assetId}`}
                            className="font-bold text-slate-700 hover:text-brand-blue transition-colors underline decoration-dotted"
                          >
                            {item.assetName}
                          </Link>
                          <span className="text-[10px] text-slate-400 ml-1.5 font-bold px-1.5 py-0.5 rounded bg-slate-100">
                            {item.assetTag}
                          </span>
                        </>
                      ) : (
                        item.metadata?.description ? (
                          <span className="text-slate-600 ml-1">
                            — {String(item.metadata.description)}
                          </span>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default RecentActivity;
