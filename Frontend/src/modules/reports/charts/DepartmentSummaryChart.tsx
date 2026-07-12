import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

interface DepartmentItem {
  departmentId: string;
  departmentName: string;
  totalAssets: number;
  allocatedAssets: number;
  availableAssets: number;
  bookableAssets: number;
  employeeCount: number;
}

interface DepartmentSummaryChartProps {
  data: DepartmentItem[];
}

export const DepartmentSummaryChart: React.FC<DepartmentSummaryChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: item.departmentName,
    "Total Assets": item.totalAssets,
    "Allocated Assets": item.allocatedAssets,
    "Bookable Assets": item.bookableAssets,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        No department summary data available.
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
          />
          <Legend
            verticalAlign="top"
            height={32}
            iconSize={8}
            iconType="circle"
            wrapperStyle={{ fontSize: "10px", fontWeight: "bold", color: "#53565a" }}
          />
          <Bar dataKey="Total Assets" fill="#4262ff" radius={[4, 4, 0, 0]} maxBarSize={20} />
          <Bar dataKey="Allocated Assets" fill="#25a244" radius={[4, 4, 0, 0]} maxBarSize={20} />
          <Bar dataKey="Bookable Assets" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default DepartmentSummaryChart;
