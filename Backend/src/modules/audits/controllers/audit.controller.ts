import type { Request, Response, NextFunction } from "express";
import { auditService } from "../services/audit.service.js";
import {
  createAuditCycleSchema,
  updateAuditCycleSchema,
  assignAuditorsSchema,
  verifyAssetSchema,
  auditQuerySchema,
} from "../validators/audit.validator.js";
import type { Role } from "../../../types/index.js";

export const auditController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createAuditCycleSchema.parse(req.body);
      const createdBy = res.locals.user.id as string;
      const data = await auditService.create(body, createdBy);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = updateAuditCycleSchema.parse(req.body);
      const data = await auditService.update(id, body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async assignAuditors(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = assignAuditorsSchema.parse(req.body);
      const data = await auditService.assignAuditors(id, body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async verifyAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const auditCycleId = req.params["id"] as string;
      const assetId = req.params["assetId"] as string;
      const body = verifyAssetSchema.parse(req.body);
      const verifiedBy = res.locals.user.id as string;
      const data = await auditService.verifyAsset(auditCycleId, assetId, body, verifiedBy);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = auditQuerySchema.parse(req.query);
      const { id: requesterId, role } = res.locals.user;
      const result = await auditService.getAll(query, requesterId as string, role as Role);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const { id: requesterId, role } = res.locals.user;
      const data = await auditService.getById(id, requesterId as string, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getDiscrepancyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const { id: requesterId, role } = res.locals.user;
      const data = await auditService.getDiscrepancyReport(id, requesterId as string, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async close(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const closedBy = res.locals.user.id as string;
      const data = await auditService.close(id, closedBy);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
