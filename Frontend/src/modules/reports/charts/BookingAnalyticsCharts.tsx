import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// ── Booking Over Time Area Chart ───────────────────────────────────────────────
interface BookingOverTimeProps {
  data: { date: string; count: number }[];
}

export const BookingOverTimeChart: React.FC<BookingOverTimeProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    count: item.count,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        No booking timelines available.
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4262ff" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4262ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
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
            contentStyle={{
              backgroundColor: "#050038",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontSize: "11px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value: any) => [`${value} Bookings`]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#4262ff"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#bookingGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── Booking Heatmap-Style Peak Hours Grid ───────────────────────────────────────
interface BookingHeatmapProps {
  peakHours: { hour: number; label: string; count: number }[];
}

export const BookingHeatmapChart: React.FC<BookingHeatmapProps> = ({ peakHours }) => {
  const maxCount = Math.max(...peakHours.map((h) => h.count), 0);

  // Group into 24 standard hours if they are not already complete, 
  // or just sort the list of peak hours.
  const sortedHours = [...peakHours].sort((a, b) => a.hour - b.hour);

  if (sortedHours.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        No hourly booking records available.
      </div>
    );
  }

  const formatHourLabel = (hour: number) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 || 12;
    return `${h} ${ampm}`;
  };

  return (
    <div className="flex flex-col justify-between h-[220px] w-full">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
        Hourly Peak Reservation Frequency
      </p>

      {/* Heatmap Grid */}
      <div className="flex-1 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5 min-h-0">
        {sortedHours.map((item) => {
          const ratio = maxCount > 0 ? item.count / maxCount : 0;
          
          // Color intensity: base color `#4262ff` with varying opacity
          // Background matches brand-blue with custom alpha
          const cellColor = ratio > 0 
            ? `rgba(66, 98, 255, ${Math.max(0.08, ratio * 0.95)})` 
            : "#f8fafc";
          
          const textColor = ratio > 0.5 ? "text-white" : "text-slate-700";

          return (
            <div
              key={item.hour}
              className={`group relative rounded-lg border border-slate-100 flex flex-col items-center justify-center p-1.5 transition-all hover:scale-[1.03] hover:shadow-sm cursor-help`}
              style={{ backgroundColor: cellColor }}
            >
              <span className={`text-[10px] font-bold ${textColor}`}>
                {formatHourLabel(item.hour)}
              </span>
              <span className={`text-[9px] opacity-75 font-semibold ${textColor}`}>
                {item.count}
              </span>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                {item.label}: {item.count} Bookings
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-end gap-2 text-[9px] text-slate-400 font-bold mt-2">
        <span>Low activity</span>
        <div className="flex gap-0.5">
          <span className="h-3 w-5 bg-slate-50 border border-slate-100 rounded" />
          <span className="h-3 w-5 rounded" style={{ backgroundColor: "rgba(66, 98, 255, 0.1)" }} />
          <span className="h-3 w-5 rounded" style={{ backgroundColor: "rgba(66, 98, 255, 0.4)" }} />
          <span className="h-3 w-5 rounded" style={{ backgroundColor: "rgba(66, 98, 255, 0.7)" }} />
          <span className="h-3 w-5 rounded" style={{ backgroundColor: "rgba(66, 98, 255, 0.95)" }} />
        </div>
        <span>Peak Hours</span>
      </div>
    </div>
  );
};
