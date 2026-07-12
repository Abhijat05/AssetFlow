import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts";
import type { DashboardAuditStats } from "../types";

interface AuditProgressProps {
  stats: DashboardAuditStats;
}

export const AuditProgress: React.FC<AuditProgressProps> = ({ stats }) => {
  const data = [
    { name: "Planned", value: stats.planned, color: "#94a3b8" },
    { name: "Active", value: stats.active, color: "#ffd02f" },
    { name: "Completed", value: stats.completed, color: "#25a244" },
    { name: "Discrepancies", value: stats.discrepancies, color: "#ff7c65" },
  ];

  const total = stats.planned + stats.active + stats.completed;

  if (total === 0 && stats.discrepancies === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-slate-400">
        No audit cycles scheduled.
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                value,
                name === "Discrepancies" ? "Issues Detected" : "Audit Cycles",
              ]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100 mt-2">
        <span className="text-slate-400">Total Cycles: <strong className="text-slate-700">{total}</strong></span>
        {stats.discrepancies > 0 ? (
          <span className="text-brand-coral font-semibold animate-pulse">
            ⚠️ {stats.discrepancies} Discrepancies
          </span>
        ) : (
          <span className="text-emerald-600 font-semibold">✓ Audits Clean</span>
        )}
      </div>
    </div>
  );
};
export default AuditProgress;
