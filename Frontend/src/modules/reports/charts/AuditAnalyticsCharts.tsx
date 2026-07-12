import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid, PieChart, Pie } from "recharts";

// ── Audit Summary Status Bar Chart ─────────────────────────────────────────────
interface AuditSummaryProps {
  summary: {
    total: number;
    planned: number;
    active: number;
    completed: number;
    cancelled: number;
  };
}

export const AuditSummaryChart: React.FC<AuditSummaryProps> = ({ summary }) => {
  const data = [
    { name: "Planned", value: summary.planned, color: "#94a3b8" },
    { name: "Active", value: summary.active, color: "#ffd02f" },
    { name: "Completed", value: summary.completed, color: "#25a244" },
    { name: "Cancelled", value: summary.cancelled, color: "#ff7c65" },
  ];

  if (summary.total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        No audit cycles recorded.
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
            formatter={(value: any) => [`${value} Cycles`, "Total"]}
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

// ── Audit Discrepancies Donut Chart ────────────────────────────────────────────
interface AuditDiscrepanciesProps {
  discrepancies: {
    missing: number;
    damaged: number;
    resolvedDiscrepancies: number;
  };
}

export const AuditDiscrepanciesChart: React.FC<AuditDiscrepanciesProps> = ({ discrepancies }) => {
  const data = [
    { name: "Missing Assets", value: discrepancies.missing, color: "#d9383a" },
    { name: "Damaged Assets", value: discrepancies.damaged, color: "#ffd02f" },
    { name: "Resolved Issues", value: discrepancies.resolvedDiscrepancies, color: "#25a244" },
  ].filter((item) => item.value > 0);

  const total = discrepancies.missing + discrepancies.damaged + discrepancies.resolvedDiscrepancies;

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        No discrepancies detected (Audits clean).
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value} Records`]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-extrabold text-primary tracking-tight">
          {total}
        </span>
        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
          Discrepancies
        </span>
      </div>
    </div>
  );
};
