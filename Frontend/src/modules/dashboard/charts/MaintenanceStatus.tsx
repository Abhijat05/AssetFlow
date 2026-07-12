import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import type { DashboardMaintenanceStats } from "../types";

interface MaintenanceStatusProps {
  stats: DashboardMaintenanceStats;
}

export const MaintenanceStatus: React.FC<MaintenanceStatusProps> = ({ stats }) => {
  const data = [
    { name: "Pending", value: stats.pending, color: "#ffd02f" },
    { name: "Approved", value: stats.approved, color: "#6366f1" },
    { name: "In Progress", value: stats.inProgress, color: "#4262ff" },
    { name: "Resolved", value: stats.resolved, color: "#25a244" },
    { name: "Rejected", value: stats.rejected, color: "#d9383a" },
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-slate-400">
        No maintenance records available.
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full flex flex-col justify-between">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              dx={-8}
            />
            <Tooltip
              cursor={{ fill: "rgba(241, 245, 249, 0.4)", radius: 6 }}
              contentStyle={{
                backgroundColor: "#050038",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(value: any) => [`${value} Requests`, "Total"]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary indicators */}
      <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100 mt-2">
        <span className="text-slate-400">Total Requests: <strong className="text-slate-700">{total}</strong></span>
        <div className="flex gap-2">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#25a244]" />
            Resolved: <strong className="text-slate-700">{stats.resolved}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4262ff]" />
            In Progress: <strong className="text-slate-700">{stats.inProgress}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
export default MaintenanceStatus;
