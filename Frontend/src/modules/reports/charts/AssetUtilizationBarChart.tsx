import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts";

interface AssetUtilizationItem {
  assetId: string;
  assetTag: string;
  assetName: string;
  allocationCount: number;
}

interface AssetUtilizationBarChartProps {
  data: AssetUtilizationItem[];
  color: string;
}

export const AssetUtilizationBarChart: React.FC<AssetUtilizationBarChartProps> = ({
  data,
  color,
}) => {
  const chartData = data.map((item) => ({
    name: item.assetName,
    tag: item.assetTag,
    value: item.allocationCount,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        No utilization list data available.
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 15, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
          <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
          <YAxis
            dataKey="name"
            type="category"
            stroke="#94a3b8"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            width={90}
            tickFormatter={(value) => (value && value.length > 12 ? `${value.slice(0, 10)}...` : value)}
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
            formatter={(value: any, _: any, props: any) => [
              `${value} Allocations`,
              `${props.payload.tag || "Asset"}`,
            ]}
          />
          <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} maxBarSize={16}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default AssetUtilizationBarChart;
