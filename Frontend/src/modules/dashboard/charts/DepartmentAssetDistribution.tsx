import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface DepartmentDistributionItem {
  name: string;
  assetsCount: number;
}

interface DepartmentAssetDistributionProps {
  data: DepartmentDistributionItem[] | undefined;
  isLoading: boolean;
}

export const DepartmentAssetDistribution: React.FC<DepartmentAssetDistributionProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex h-[240px] flex-col items-center justify-center space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#4262ff] border-t-transparent" />
        <span className="text-xs text-slate-400">Loading department data...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-slate-400">
        No department asset distribution data available.
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.assetsCount, 0);

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
              formatter={(value: any) => [`${value} Assets`, "Assets"]}
            />
            <Bar dataKey="assetsCount" fill="#4262ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100 mt-2">
        <span className="text-slate-400">Total Classified Assets: <strong className="text-slate-700">{total}</strong></span>
        <span className="text-slate-500 font-semibold">{data.length} Departments represented</span>
      </div>
    </div>
  );
};
export default DepartmentAssetDistribution;
