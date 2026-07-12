import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Wrench, ArrowRightLeft, ShieldAlert, ArrowUpRight } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { KpiData } from "../types";
import type { UserRole } from "../../../types/auth";

interface PendingItemsProps {
  kpis: KpiData;
  role: UserRole;
}

export const PendingItems: React.FC<PendingItemsProps> = ({ kpis, role }) => {
  const isEmployee = role === "EMPLOYEE";

  const items = [
    {
      label: "Pending Maintenance",
      count: kpis.pendingMaintenanceRequests,
      description: isEmployee
        ? "Fault reports filed by you awaiting review"
        : "Asset repair requests awaiting approval",
      icon: <Wrench className="h-4 w-4 text-amber-600" />,
      bgClass: "bg-amber-50",
      to: "/maintenance",
      show: true,
    },
    {
      label: "Pending Transfers",
      count: kpis.pendingTransferRequests,
      description: "Asset transfers between departments awaiting approval",
      icon: <ArrowRightLeft className="h-4 w-4 text-[#4262ff]" />,
      bgClass: "bg-[#4262ff]/10",
      to: "/allocations",
      show: !isEmployee,
    },
    {
      label: "Active Audits",
      count: kpis.activeAuditCycles,
      description: "Inventory reconciliation audit cycles in progress",
      icon: <ShieldAlert className="h-4 w-4 text-purple-600" />,
      bgClass: "bg-purple-50",
      to: "/audits",
      show: !isEmployee,
    },
  ].filter((item) => item.show);

  const totalPending = items.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white h-full flex flex-col">
      <CardHeader className="p-5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#050038]">Pending Items</CardTitle>
          {totalPending > 0 && (
            <span className="text-[10px] font-extrabold text-[#d9383a] bg-[#d9383a]/10 px-2 py-0.5 rounded-full">
              {totalPending} Action Items
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5 flex-1 min-h-0 overflow-y-auto space-y-4">
        {totalPending === 0 ? (
          <div className="flex h-full min-h-[160px] flex-col items-center justify-center text-center p-4">
            <span className="h-9 w-9 rounded-xl bg-emerald-50 text-[#25a244] flex items-center justify-center mb-2">
              ✓
            </span>
            <p className="text-xs text-slate-400 font-bold">All caught up!</p>
            <p className="text-[10px] text-slate-400 mt-0.5">No pending items require your attention.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {items.map(
              (item) =>
                item.count > 0 && (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="group block p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#4262ff] hover:shadow-sm transition-all duration-150"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            item.bgClass
                          )}
                        >
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 group-hover:text-[#4262ff] transition-colors truncate">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-xs font-extrabold text-[#050038] bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.count}
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#4262ff] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default PendingItems;
