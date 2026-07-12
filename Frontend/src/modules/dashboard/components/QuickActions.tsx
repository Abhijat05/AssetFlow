import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/card";
import {
  PlusCircle,
  UserPlus,
  CalendarPlus,
  Wrench,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import type { QuickActions as QuickActionsType } from "../types";

interface QuickActionsProps {
  actions: QuickActionsType;
}

interface ActionItem {
  key: keyof QuickActionsType;
  label: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  colorClass: string;
  bgClass: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const navigate = useNavigate();

  const actionList: ActionItem[] = [
    {
      key: "registerAsset",
      label: "Register Asset",
      description: "Add a new asset to the company registry",
      icon: <PlusCircle className="h-5 w-5" />,
      to: "/assets",
      colorClass: "text-[#4262ff]",
      bgClass: "bg-[#4262ff]/10",
    },
    {
      key: "allocateAsset",
      label: "Allocate Asset",
      description: "Assign a registered asset to an employee",
      icon: <UserPlus className="h-5 w-5" />,
      to: "/allocations",
      colorClass: "text-indigo-600",
      bgClass: "bg-indigo-50",
    },
    {
      key: "bookResource",
      label: "Book Resource",
      description: "Reserve a shared facility, vehicle, or equipment",
      icon: <CalendarPlus className="h-5 w-5" />,
      to: "/bookings",
      colorClass: "text-[#00a3a3]",
      bgClass: "bg-[#00a3a3]/10",
    },
    {
      key: "raiseMaintenanceRequest",
      label: "Raise Maintenance",
      description: "Report a fault or request servicing for an asset",
      icon: <Wrench className="h-5 w-5" />,
      to: "/maintenance",
      colorClass: "text-amber-600",
      bgClass: "bg-amber-50",
    },
    {
      key: "createAudit",
      label: "Create Audit Cycle",
      description: "Start a physical reconciliation and verification audit",
      icon: <ShieldAlert className="h-5 w-5" />,
      to: "/audits",
      colorClass: "text-purple-600",
      bgClass: "bg-purple-50",
    },
  ];

  // Filter actions based on the permissions returned by backend
  const visibleActions = actionList.filter((item) => actions[item.key]);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-reveal">
      {visibleActions.map((action) => (
        <button
          key={action.key}
          onClick={() => navigate(action.to)}
          className="group text-left w-full focus:outline-none"
        >
          <Card className="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
            <CardContent className="p-0 flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
                    action.bgClass,
                    action.colorClass
                  )}
                >
                  {action.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#050038] group-hover:text-[#4262ff] transition-colors truncate">
                    {action.label}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed truncate mt-0.5">
                    {action.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#4262ff] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
};
export default QuickActions;
