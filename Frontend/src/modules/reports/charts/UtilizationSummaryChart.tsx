import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface UtilizationSummaryChartProps {
  summary: {
    total: number;
    utilized: number;
    idle: number;
    utilizationPercentage: number;
  };
}

export const UtilizationSummaryChart: React.FC<UtilizationSummaryChartProps> = ({ summary }) => {
  const data = [
    { name: "Utilized Assets", value: summary.utilized, color: "#4262ff" },
    { name: "Idle Assets", value: summary.idle, color: "#25a244" },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        No utilization data to display.
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
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
            formatter={(value: any) => [`${value} Assets`]}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center Text displaying utilization % */}
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-extrabold text-[#050038] tracking-tight">
          {summary.utilizationPercentage}%
        </span>
        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
          Utilization
        </span>
      </div>
    </div>
  );
};
export default UtilizationSummaryChart;
