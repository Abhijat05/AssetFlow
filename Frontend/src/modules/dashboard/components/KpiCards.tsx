import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import {
  CheckCircle2,
  UserCheck,
  Wrench,
  Calendar,
  AlertTriangle,
  Archive,
  CalendarDays,
  ArrowRightLeft,
  Clock,
  CalendarX,
  FileCheck2,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import type { KpiData } from "../types";
import type { UserRole } from "../../../types/auth";

interface KpiCardsProps {
  kpis: KpiData;
  role: UserRole;
}

interface KpiItem {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  colorClass: string;
  bgClass: string;
  iconColorClass: string;
  isOverdue?: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpis, role }) => {
  const isEmployee = role === "EMPLOYEE";
  const isDeptHead = role === "DEPARTMENT_HEAD";

  // Define all possible KPIs
  const allKpis: Record<string, KpiItem> = {
    assetsAvailable: {
      title: "Assets Available",
      value: kpis.assetsAvailable,
      icon: <CheckCircle2 className="h-5 w-5" />,
      description: isDeptHead ? "Ready for dept use" : "Ready to allocate",
      colorClass: "text-[#25a244]",
      bgClass: "bg-[#25a244]/10",
      iconColorClass: "text-[#25a244]",
    },
    assetsAllocated: {
      title: isEmployee ? "My Allocated Assets" : "Assets Allocated",
      value: kpis.assetsAllocated,
      icon: <UserCheck className="h-5 w-5" />,
      description: isEmployee ? "Currently assigned to you" : "In use by employees",
      colorClass: "text-[#4262ff]",
      bgClass: "bg-[#4262ff]/10",
      iconColorClass: "text-[#4262ff]",
    },
    assetsUnderMaintenance: {
      title: "Under Maintenance",
      value: kpis.assetsUnderMaintenance,
      icon: <Wrench className="h-5 w-5" />,
      description: "Assets in servicing",
      colorClass: "text-[#ffd02f]",
      bgClass: "bg-[#ffd02f]/15",
      iconColorClass: "text-amber-600",
    },
    assetsReserved: {
      title: "Assets Reserved",
      value: kpis.assetsReserved,
      icon: <Calendar className="h-5 w-5" />,
      description: "Held for bookings",
      colorClass: "text-indigo-600",
      bgClass: "bg-indigo-50",
      iconColorClass: "text-indigo-600",
    },
    assetsLost: {
      title: "Assets Lost",
      value: kpis.assetsLost,
      icon: <AlertTriangle className="h-5 w-5" />,
      description: "Reported missing",
      colorClass: "text-[#ff7c65]",
      bgClass: "bg-[#ff7c65]/10",
      iconColorClass: "text-[#ff7c65]",
    },
    assetsRetired: {
      title: "Assets Retired",
      value: kpis.assetsRetired,
      icon: <Archive className="h-5 w-5" />,
      description: "Archived/Decommissioned",
      colorClass: "text-slate-500",
      bgClass: "bg-slate-50",
      iconColorClass: "text-slate-500",
    },
    todaysBookings: {
      title: isEmployee ? "My Bookings Today" : "Today's Bookings",
      value: kpis.todaysBookings,
      icon: <CalendarDays className="h-5 w-5" />,
      description: "Active bookings today",
      colorClass: "text-[#00a3a3]",
      bgClass: "bg-[#00a3a3]/10",
      iconColorClass: "text-[#00a3a3]",
    },
    pendingTransfers: {
      title: "Pending Transfers",
      value: kpis.pendingTransferRequests,
      icon: <ArrowRightLeft className="h-5 w-5" />,
      description: "Department relocations",
      colorClass: "text-orange-500",
      bgClass: "bg-orange-50",
      iconColorClass: "text-orange-600",
    },
    upcomingReturns: {
      title: isEmployee ? "My Upcoming Returns" : "Upcoming Returns",
      value: kpis.upcomingReturns,
      icon: <Clock className="h-5 w-5" />,
      description: "Due within 7 days",
      colorClass: "text-cyan-600",
      bgClass: "bg-cyan-50",
      iconColorClass: "text-cyan-600",
    },
    overdueReturns: {
      title: isEmployee ? "My Overdue Returns" : "Overdue Returns",
      value: kpis.overdueReturns,
      icon: <CalendarX className="h-5 w-5" />,
      description: "Expected date passed",
      colorClass: "text-[#d9383a]",
      bgClass: "bg-[#d9383a]/10",
      iconColorClass: "text-[#d9383a]",
      isOverdue: kpis.overdueReturns > 0,
    },
    activeAudits: {
      title: "Active Audits",
      value: kpis.activeAuditCycles,
      icon: <FileCheck2 className="h-5 w-5" />,
      description: "Cycles awaiting validation",
      colorClass: "text-purple-600",
      bgClass: "bg-purple-50",
      iconColorClass: "text-purple-600",
    },
  };

  // Determine which cards to show based on the user's role
  const visibleKeys = isEmployee
    ? [
        "assetsAllocated",
        "todaysBookings",
        "upcomingReturns",
        "overdueReturns",
      ]
    : isDeptHead
    ? [
        "assetsAvailable",
        "assetsAllocated",
        "assetsUnderMaintenance",
        "todaysBookings",
        "pendingTransfers",
        "upcomingReturns",
        "overdueReturns",
        "activeAudits",
      ]
    : [
        "assetsAvailable",
        "assetsAllocated",
        "assetsUnderMaintenance",
        "assetsReserved",
        "assetsLost",
        "assetsRetired",
        "todaysBookings",
        "pendingTransfers",
        "upcomingReturns",
        "overdueReturns",
        "activeAudits",
      ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-reveal">
      {visibleKeys.map((key) => {
        const item = allKpis[key];
        if (!item) return null;

        return (
          <Card
            key={key}
            className={cn(
              "group overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all duration-200",
              item.isOverdue && "border-[#d9383a]/40 bg-[#d9383a]/[0.02]"
            )}
          >
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">
                  {item.title}
                </p>
                <div
                  className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center transition-all group-hover:scale-105",
                    item.bgClass,
                    item.iconColorClass
                  )}
                >
                  {item.icon}
                </div>
              </div>

              <div>
                <h3
                  className={cn(
                    "text-2xl font-extrabold tracking-tight",
                    item.isOverdue ? "text-[#d9383a]" : "text-[#050038]"
                  )}
                >
                  {item.value}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-medium leading-normal">
                  {item.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
export default KpiCards;
