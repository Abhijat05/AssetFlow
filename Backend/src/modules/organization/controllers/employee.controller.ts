import type { Request, Response, NextFunction } from "express";
import { employeeService } from "../services/employee.service.js";
import {
  employeeQuerySchema,
  updateDepartmentSchema,
  updateRoleSchema,
  updateStatusSchema,
} from "../validators/employee.validator.js";

export const employeeController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = employeeQuerySchema.parse(req.query);
      const result = await employeeService.getAll(query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const data = await employeeService.getById(id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = updateDepartmentSchema.parse(req.body);
      const data = await employeeService.updateDepartment(id, body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = updateRoleSchema.parse(req.body);
      const performedById = res.locals.user.id as string;
      const data = await employeeService.updateRole(id, body, performedById);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = updateStatusSchema.parse(req.body);
      const data = await employeeService.updateStatus(id, body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
