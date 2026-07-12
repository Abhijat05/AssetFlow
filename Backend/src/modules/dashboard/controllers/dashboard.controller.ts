import type { Request, Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service.js";
import type { Role } from "../../../types/index.js";

export const dashboardController = {
  async getFull(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId, role } = res.locals.user;
      const data = await dashboardService.getFull(userId as string, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getKpis(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId, role } = res.locals.user;
      const data = await dashboardService.getKpis(userId as string, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId, role } = res.locals.user;
      const data = await dashboardService.getActivity(userId as string, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getReturns(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId, role } = res.locals.user;
      const data = await dashboardService.getReturns(userId as string, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId, role } = res.locals.user;
      const data = await dashboardService.getBookings(userId as string, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId, role } = res.locals.user;
      const data = await dashboardService.getMaintenance(userId as string, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getAudits(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: userId, role } = res.locals.user;
      const data = await dashboardService.getAudits(userId as string, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
