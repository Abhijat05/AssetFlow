import type { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/category.service.js";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validator.js";

export const categoryController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await categoryService.getAll();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const data = await categoryService.getById(id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createCategorySchema.parse(req.body);
      const data = await categoryService.create(body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = updateCategorySchema.parse(req.body);
      const data = await categoryService.update(id, body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const data = await categoryService.deactivate(id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
