import type { Request, Response, NextFunction } from "express";
import { bookingService } from "../services/booking.service.js";
import {
  createBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
  bookingQuerySchema,
  calendarQuerySchema,
} from "../validators/booking.validator.js";
import type { Role } from "../../../types/index.js";

export const bookingController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createBookingSchema.parse(req.body);
      const bookedBy = res.locals.user.id as string;
      const data = await bookingService.create(body, bookedBy);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = bookingQuerySchema.parse(req.query);
      const result = await bookingService.getAll(query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const data = await bookingService.getById(id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const assetId = req.params["assetId"] as string;
      const query = calendarQuerySchema.parse(req.query);
      const data = await bookingService.getCalendar(assetId, query);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = updateBookingSchema.parse(req.body);
      const { id: requesterId, role } = res.locals.user;
      const data = await bookingService.update(id, body, requesterId, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = cancelBookingSchema.parse(req.body);
      const { id: requesterId, role } = res.locals.user;
      const data = await bookingService.cancel(id, body, requesterId, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
