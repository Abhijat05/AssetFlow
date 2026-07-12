import type { Request, Response, NextFunction } from "express";
import { departmentService } from "../services/department.service.js";
import { createDepartmentSchema, updateDepartmentSchema } from "../validators/department.validator.js";

export const departmentController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await departmentService.getAll();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const data = await departmentService.getById(id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createDepartmentSchema.parse(req.body);
      const data = await departmentService.create(body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = updateDepartmentSchema.parse(req.body);
      const data = await departmentService.update(id, body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const data = await departmentService.deactivate(id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
