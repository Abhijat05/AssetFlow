import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface LifecycleStatusItem {
  status: string;
  count: number;
  percentage: number;
}

interface AssetLifecycleStatusChartProps {
  data: LifecycleStatusItem[];
  total: number;
}

export const AssetLifecycleStatusChart: React.FC<AssetLifecycleStatusChartProps> = ({ data, total }) => {
  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("AVAILABLE")) return "#25a244";
    if (s.includes("ALLOCATED") || s.includes("IN_USE") || s.includes("ACTIVE")) return "#4262ff";
    if (s.includes("MAINTENANCE")) return "#ffd02f";
    if (s.includes("RETIRED") || s.includes("ARCHIVED")) return "#94a3b8";
    if (s.includes("LOST")) return "#ff7c65";
    return "#6366f1"; // default purple
  };

  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item.status.replace(/_/g, " "),
      value: item.count,
      percentage: item.percentage,
      color: getStatusColor(item.status),
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        No asset status data to display.
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#050038",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, _: any, props: any) => [
              `${value} Assets (${props.payload.percentage}%)`,
              "Status",
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center Text displaying total assets */}
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-extrabold text-primary tracking-tight">
          {total}
        </span>
        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
          Total Assets
        </span>
      </div>
    </div>
  );
};
export default AssetLifecycleStatusChart;
