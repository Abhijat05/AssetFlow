import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { KpiData } from "../types";

interface AssetStatusDistributionProps {
  kpis: KpiData;
}

export const AssetStatusDistribution: React.FC<AssetStatusDistributionProps> = ({ kpis }) => {
  const data = [
    { name: "Available", value: kpis.assetsAvailable, color: "#25a244" },
    { name: "Allocated", value: kpis.assetsAllocated, color: "#4262ff" },
    { name: "Maintenance", value: kpis.assetsUnderMaintenance, color: "#ffd02f" },
    { name: "Reserved", value: kpis.assetsReserved, color: "#6366f1" },
    { name: "Lost", value: kpis.assetsLost, color: "#d9383a" },
    { name: "Retired", value: kpis.assetsRetired, color: "#94a3b8" },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-slate-400">
        No asset status data available.
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="h-[240px] w-full flex flex-col justify-between">
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [
                `${value} (${((value / total) * 100).toFixed(0)}%)`,
                "Assets",
              ]}
              contentStyle={{
                backgroundColor: "#050038",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center overlay showing total assets */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold text-[#050038] tracking-tight">{total}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Assets</span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 pt-2 text-[11px] font-medium text-slate-500 border-t border-slate-100">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5 truncate">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate text-slate-700">{item.name}</span>
            <span className="ml-auto text-slate-400 font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AssetStatusDistribution;
