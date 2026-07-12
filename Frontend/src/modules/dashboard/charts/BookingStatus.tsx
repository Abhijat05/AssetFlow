import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import type { DashboardBookingItem } from "../types";

interface BookingStatusProps {
  bookings: {
    today: DashboardBookingItem[];
    ongoing: DashboardBookingItem[];
    upcoming: DashboardBookingItem[];
  };
}

export const BookingStatus: React.FC<BookingStatusProps> = ({ bookings }) => {
  const data = [
    { name: "Ongoing", value: bookings.ongoing.length, color: "#25a244" },
    { name: "Today's", value: bookings.today.length, color: "#ffd02f" },
    { name: "Upcoming", value: bookings.upcoming.length, color: "#4262ff" },
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-slate-400">
        No active booking records available.
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full flex flex-col justify-between">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
          >
            <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={70}
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
              formatter={(value: any) => [`${value} Bookings`, "Total"]}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100 mt-2">
        <span className="text-slate-400">Total Bookings: <strong className="text-slate-700">{total}</strong></span>
        <span className="text-slate-500 font-semibold">{bookings.ongoing.length} active now</span>
      </div>
    </div>
  );
};
export default BookingStatus;
