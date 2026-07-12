import PDFDocument from "pdfkit";
import type { TableSection } from "../types/index.js";

const MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4
const USABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;
const ROW_HEIGHT = 18;
const HEADER_COLOR = "#2D5BE3";
const ALT_ROW_COLOR = "#F3F6FF";
const TEXT_COLOR = "#1A1A2E";

function drawTable(
  doc: InstanceType<typeof PDFDocument>,
  section: TableSection,
  startY: number
): number {
  let y = startY;
  const colCount = section.headers.length || 1;
  const colWidth = USABLE_WIDTH / colCount;

  // Section title
  doc.font("Helvetica-Bold").fontSize(10).fillColor(HEADER_COLOR);
  doc.text(section.title, MARGIN, y, { width: USABLE_WIDTH });
  y += 16;

  // Header row
  doc.fillColor(HEADER_COLOR);
  doc.rect(MARGIN, y, USABLE_WIDTH, ROW_HEIGHT).fill();
  doc.font("Helvetica-Bold").fontSize(8).fillColor("white");
  section.headers.forEach((h, i) => {
    doc.text(h, MARGIN + i * colWidth + 4, y + 4, { width: colWidth - 8, lineBreak: false });
  });
  y += ROW_HEIGHT;

  // Data rows
  doc.font("Helvetica").fontSize(8);
  section.rows.forEach((row, ri) => {
    // Page break check
    if (y > doc.page.height - MARGIN - ROW_HEIGHT) {
      doc.addPage();
      y = MARGIN;
    }

    if (ri % 2 === 1) {
      doc.fillColor(ALT_ROW_COLOR);
      doc.rect(MARGIN, y, USABLE_WIDTH, ROW_HEIGHT).fill();
    }

    doc.fillColor(TEXT_COLOR);
    row.forEach((cell, i) => {
      const text = cell !== null && cell !== undefined ? String(cell) : "—";
      doc.text(text, MARGIN + i * colWidth + 4, y + 4, { width: colWidth - 8, lineBreak: false });
    });
    y += ROW_HEIGHT;
  });

  if (section.rows.length === 0) {
    doc.fillColor("#888888").fontSize(8).text("No data", MARGIN + 4, y + 4);
    y += ROW_HEIGHT;
  }

  return y + 16; // gap after table
}

export function toPdf(sections: TableSection[], title: string, generatedAt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Cover header
    doc.font("Helvetica-Bold").fontSize(18).fillColor(HEADER_COLOR);
    doc.text("AssetFlow", MARGIN, MARGIN);
    doc.font("Helvetica").fontSize(14).fillColor(TEXT_COLOR);
    doc.text(title, MARGIN, doc.y + 4);
    doc.font("Helvetica").fontSize(9).fillColor("#666666");
    doc.text(`Generated: ${generatedAt}`, MARGIN, doc.y + 2);

    // Divider
    const dividerY = doc.y + 8;
    doc.moveTo(MARGIN, dividerY).lineTo(PAGE_WIDTH - MARGIN, dividerY).strokeColor(HEADER_COLOR).lineWidth(1).stroke();
    let y = dividerY + 16;

    for (const section of sections) {
      if (y > doc.page.height - MARGIN - 60) {
        doc.addPage();
        y = MARGIN;
      }
      y = drawTable(doc, section, y);
    }

    doc.end();
  });
}
