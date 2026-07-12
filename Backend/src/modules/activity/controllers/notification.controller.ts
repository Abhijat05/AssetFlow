import type { Request, Response } from "express";
import { notificationRepository } from "../repositories/notification.repository.js";
import { notificationQuerySchema } from "../validators/activity.validator.js";
import { NotFoundError } from "../../../utils/errors.js";
import type { Role } from "../../../types/index.js";

export const notificationController = {
  async getNotifications(req: Request, res: Response) {
    const { id: userId, role } = res.locals.user as { id: string; role: Role };

    const result = notificationQuerySchema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error.issues.map((i) => i.message) });
      return;
    }

    const notifications = await notificationRepository.findAll(result.data, userId, role);
    res.json({ success: true, data: notifications });
  },

  async getNotification(req: Request, res: Response) {
    const { id: userId, role } = res.locals.user as { id: string; role: Role };
    const notif = await notificationRepository.findById(req.params.id as string, userId, role);
    if (!notif) throw new NotFoundError("Notification not found");
    res.json({ success: true, data: notif });
  },

  async markRead(req: Request, res: Response) {
    const { id: userId, role } = res.locals.user as { id: string; role: Role };
    const updated = await notificationRepository.markRead(req.params.id as string, userId, role);
    if (!updated) throw new NotFoundError("Notification not found or already read");
    res.json({ success: true, data: updated });
  },

  async markAllRead(_req: Request, res: Response) {
    const { id: userId } = res.locals.user as { id: string; role: Role };
    await notificationRepository.markAllRead(userId);
    res.json({ success: true, message: "All notifications marked as read" });
  },

  async deleteNotification(req: Request, res: Response) {
    const { id: userId, role } = res.locals.user as { id: string; role: Role };
    const deleted = await notificationRepository.deleteOne(req.params.id as string, userId, role);
    if (!deleted) throw new NotFoundError("Notification not found");
    res.json({ success: true, message: "Notification deleted" });
  },

  async unreadCount(_req: Request, res: Response) {
    const { id: userId, role } = res.locals.user as { id: string; role: Role };
    const count = await notificationRepository.unreadCount(userId, role);
    res.json({ success: true, data: { count } });
  },

  async getOverdue(_req: Request, res: Response) {
    const { id: userId, role } = res.locals.user as { id: string; role: Role };
    const overdue = await notificationRepository.overdueAllocations(userId, role);
    res.json({ success: true, data: overdue });
  },

  async getUpcomingBookings(_req: Request, res: Response) {
    const { id: userId, role } = res.locals.user as { id: string; role: Role };
    const bookings = await notificationRepository.upcomingBookingAlerts(userId, role);
    res.json({ success: true, data: bookings });
  },
};
