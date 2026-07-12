import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts";

interface MaintenanceStatusChartProps {
  summary: {
    total: number;
    pending: number;
    approved: number;
    inProgress: number;
    resolved: number;
    rejected: number;
  };
}

export const MaintenanceStatusChart: React.FC<MaintenanceStatusChartProps> = ({ summary }) => {
  const data = [
    { name: "Pending", value: summary.pending, color: "#ffd02f" },
    { name: "Approved", value: summary.approved, color: "#6366f1" },
    { name: "In Progress", value: summary.inProgress, color: "#4262ff" },
    { name: "Resolved", value: summary.resolved, color: "#25a244" },
    { name: "Rejected", value: summary.rejected, color: "#d9383a" },
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        No maintenance logs available.
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            dx={-8}
          />
          <Tooltip
            cursor={{ fill: "rgba(241, 245, 249, 0.4)", radius: 4 }}
            contentStyle={{
              backgroundColor: "#050038",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontSize: "11px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value} Requests`, "Total"]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default MaintenanceStatusChart;
