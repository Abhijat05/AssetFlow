import type { Request, Response } from "express";
import { reportService } from "../services/report.service.js";
import { reportFilterSchema, exportQuerySchema } from "../validators/report.validator.js";
import { toSections } from "../export/formatters.js";
import { toCsv } from "../export/csv.exporter.js";
import { toExcel } from "../export/excel.exporter.js";
import { toPdf } from "../export/pdf.exporter.js";
import type { Role } from "../../../types/index.js";
import type { ReportType } from "../types/index.js";

function extractContext(res: Response) {
  const { id: userId, role } = res.locals.user as { id: string; role: Role };
  return { userId, role };
}

function parseFilters(req: Request, res: Response): ReturnType<typeof reportFilterSchema.parse> | null {
  const result = reportFilterSchema.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({ success: false, error: result.error.issues.map((i) => i.message) });
    return null;
  }
  return result.data;
}

export const reportController = {
  async getUtilization(req: Request, res: Response) {
    const { userId, role } = extractContext(res);
    const filters = parseFilters(req, res);
    if (!filters) return;
    const data = await reportService.getUtilization(filters, userId, role);
    res.json({ success: true, data });
  },

  async getMaintenance(req: Request, res: Response) {
    const { userId, role } = extractContext(res);
    const filters = parseFilters(req, res);
    if (!filters) return;
    const data = await reportService.getMaintenance(filters, userId, role);
    res.json({ success: true, data });
  },

  async getLifecycle(req: Request, res: Response) {
    const { userId, role } = extractContext(res);
    const filters = parseFilters(req, res);
    if (!filters) return;
    const data = await reportService.getLifecycle(filters, userId, role);
    res.json({ success: true, data });
  },

  async getDepartments(req: Request, res: Response) {
    const { userId, role } = extractContext(res);
    const filters = parseFilters(req, res);
    if (!filters) return;
    const data = await reportService.getDepartments(filters, userId, role);
    res.json({ success: true, data });
  },

  async getBookings(req: Request, res: Response) {
    const { userId, role } = extractContext(res);
    const filters = parseFilters(req, res);
    if (!filters) return;
    const data = await reportService.getBookings(filters, userId, role);
    res.json({ success: true, data });
  },

  async getAudits(req: Request, res: Response) {
    const { userId, role } = extractContext(res);
    const filters = parseFilters(req, res);
    if (!filters) return;
    const data = await reportService.getAudits(filters, userId, role);
    res.json({ success: true, data });
  },

  async exportReport(req: Request, res: Response) {
    const { userId, role } = extractContext(res);

    const result = exportQuerySchema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error.issues.map((i) => i.message) });
      return;
    }

    const { report, format, ...filters } = result.data;

    let data: unknown;
    switch (report as ReportType) {
      case "utilization":
        data = await reportService.getUtilization(filters, userId, role);
        break;
      case "maintenance":
        data = await reportService.getMaintenance(filters, userId, role);
        break;
      case "lifecycle":
        data = await reportService.getLifecycle(filters, userId, role);
        break;
      case "departments":
        data = await reportService.getDepartments(filters, userId, role);
        break;
      case "bookings":
        data = await reportService.getBookings(filters, userId, role);
        break;
      case "audits":
        data = await reportService.getAudits(filters, userId, role);
        break;
    }

    const reportTitle =
      report.charAt(0).toUpperCase() + report.slice(1) + " Report";
    const generatedAt = new Date().toISOString();
    const sections = toSections(report as ReportType, data as never);

    if (format === "csv") {
      const csv = toCsv(sections);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${report}-report.csv"`
      );
      res.send(csv);
      return;
    }

    if (format === "xlsx") {
      const buf = await toExcel(sections, reportTitle);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${report}-report.xlsx"`
      );
      res.send(buf);
      return;
    }

    // pdf
    const buf = await toPdf(sections, reportTitle, generatedAt);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report}-report.pdf"`
    );
    res.send(buf);
  },
};
