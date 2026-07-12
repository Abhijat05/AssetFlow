import type { Request, Response, NextFunction } from "express";
import { maintenanceService } from "../services/maintenance.service.js";
import {
  createMaintenanceRequestSchema,
  approveRequestSchema,
  rejectRequestSchema,
  assignTechnicianSchema,
  resolveMaintenanceSchema,
  maintenanceQuerySchema,
} from "../validators/maintenance.validator.js";
import { ValidationError } from "../../../utils/errors.js";
import type { Role } from "../../../types/index.js";

export const maintenanceController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createMaintenanceRequestSchema.parse(req.body);
      const reportedBy = res.locals.user.id as string;
      const data = await maintenanceService.create(body, reportedBy);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = approveRequestSchema.parse(req.body);
      const approverId = res.locals.user.id as string;
      const data = await maintenanceService.approve(id, body, approverId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = rejectRequestSchema.parse(req.body);
      const rejectedBy = res.locals.user.id as string;
      const data = await maintenanceService.reject(id, body, rejectedBy);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async assignTechnician(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = assignTechnicianSchema.parse(req.body);
      const assignedBy = res.locals.user.id as string;
      const data = await maintenanceService.assignTechnician(id, body, assignedBy);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const startedBy = res.locals.user.id as string;
      const data = await maintenanceService.start(id, startedBy);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = resolveMaintenanceSchema.parse(req.body);
      const resolvedBy = res.locals.user.id as string;
      const data = await maintenanceService.resolve(id, body, resolvedBy);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = maintenanceQuerySchema.parse(req.query);
      const { id: requesterId, role } = res.locals.user;
      const result = await maintenanceService.getAll(query, requesterId as string, role as Role);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const { id: requesterId, role } = res.locals.user;
      const data = await maintenanceService.getById(id, requesterId as string, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async uploadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new ValidationError("No file uploaded");
      const id = req.params["id"] as string;
      const { id: uploadedBy, role } = res.locals.user;
      const data = await maintenanceService.uploadAttachment(
        id,
        req.file,
        uploadedBy as string,
        role as Role
      );
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async deleteAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const attachmentId = req.params["attachmentId"] as string;
      await maintenanceService.deleteAttachment(id, attachmentId);
      res.json({ success: true, message: "Attachment deleted" });
    } catch (err) {
      next(err);
    }
  },
};
