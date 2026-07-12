import type { Request, Response, NextFunction } from "express";
import { assetService } from "../services/asset.service.js";
import {
  createAssetSchema,
  updateAssetSchema,
  assetQuerySchema,
  uploadAttachmentSchema,
} from "../validators/asset.validator.js";
import type { AttachmentType } from "../types/index.js";

export const assetController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = assetQuerySchema.parse(req.query);
      const result = await assetService.getAll(query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const data = await assetService.getById(id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createAssetSchema.parse(req.body);
      const createdBy = res.locals.user.id as string;
      const data = await assetService.create(body, createdBy);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = updateAssetSchema.parse(req.body);
      const performedBy = res.locals.user.id as string;
      const data = await assetService.update(id, body, performedBy);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const performedBy = res.locals.user.id as string;
      const data = await assetService.archive(id, performedBy);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async uploadAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const { type } = uploadAttachmentSchema.parse(req.body);
      const file = req.file;
      if (!file) {
        res.status(422).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "File is required" },
        });
        return;
      }
      const uploadedBy = res.locals.user.id as string;
      const data = await assetService.uploadAttachment(id, type as AttachmentType, file, uploadedBy);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async deleteAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const attachmentId = req.params["attachmentId"] as string;
      const performedBy = res.locals.user.id as string;
      await assetService.deleteAttachment(id, attachmentId, performedBy);
      res.json({ success: true, message: "Attachment deleted" });
    } catch (err) {
      next(err);
    }
  },
};
