import ExcelJS from "exceljs";
import type { TableSection } from "../types/index.js";

export async function toExcel(sections: TableSection[], title: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AssetFlow";
  workbook.created = new Date();

  // Cover sheet
  const cover = workbook.addWorksheet("Report");
  cover.getCell("A1").value = title;
  cover.getCell("A1").font = { size: 16, bold: true };
  cover.getCell("A2").value = `Generated: ${new Date().toISOString()}`;
  cover.getCell("A2").font = { size: 10, italic: true };

  let row = 4;
  for (const section of sections) {
    // Section title
    const titleCell = cover.getCell(`A${row}`);
    titleCell.value = section.title;
    titleCell.font = { bold: true, size: 12 };
    cover.getRow(row).height = 18;
    row++;

    if (section.headers.length === 0) continue;

    // Header row
    const headerRow = cover.getRow(row);
    section.headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FF4472C4" } },
      };
    });
    // Auto-width hint
    section.headers.forEach((h, i) => {
      const col = cover.getColumn(i + 1);
      col.width = Math.max(col.width ?? 10, h.length + 4);
    });
    row++;

    // Data rows
    for (const dataRow of section.rows) {
      const r = cover.getRow(row);
      dataRow.forEach((v, i) => {
        r.getCell(i + 1).value = v ?? "";
        // Widen column if value is wider
        const col = cover.getColumn(i + 1);
        col.width = Math.max(col.width ?? 10, String(v ?? "").length + 2);
      });
      row++;
    }

    row += 2; // blank rows between sections
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
