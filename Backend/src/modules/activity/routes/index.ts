import { Router } from "express";
import { requireAuth, requireRole } from "../../../middleware/auth.middleware.js";
import { logController } from "../controllers/log.controller.js";
import { notificationController } from "../controllers/notification.controller.js";

const router = Router();
router.use(requireAuth());

// ── Activity Logs ──────────────────────────────────────────────────────────

const logsRouter = Router();

// EMPLOYEE sees only their own logs — controller enforces it
logsRouter.get("/", logController.getLogs);
logsRouter.get("/:id", logController.getLog);

router.use(
  "/logs",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"),
  logsRouter
);

// ── Notifications ──────────────────────────────────────────────────────────

const notifRouter = Router();

notifRouter.get("/unread-count", notificationController.unreadCount);
notifRouter.get("/overdue", notificationController.getOverdue);
notifRouter.get("/upcoming-bookings", notificationController.getUpcomingBookings);
notifRouter.get("/", notificationController.getNotifications);
notifRouter.get("/:id", notificationController.getNotification);
notifRouter.patch("/:id/read", notificationController.markRead);
notifRouter.patch("/read-all", notificationController.markAllRead);
notifRouter.delete("/:id", notificationController.deleteNotification);

router.use("/notifications", notifRouter);

export default router;
