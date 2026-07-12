import type { TableSection } from "../types/index.js";

function escapeCell(v: string | number | null): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(sections: TableSection[]): string {
  const lines: string[] = [];
  for (const section of sections) {
    lines.push(escapeCell(section.title));
    lines.push(section.headers.map(escapeCell).join(","));
    for (const row of section.rows) {
      lines.push(row.map(escapeCell).join(","));
    }
    lines.push(""); // blank separator between sections
  }
  return lines.join("\n");
}
