import { Router } from "express";
import { bookingController } from "../controllers/booking.controller.js";
import { requireAuth } from "../../../middleware/auth.middleware.js";

const router = Router();

// All four roles have booking access — EMPLOYEE ownership is enforced at service level
// Static routes before /:id
router.get("/calendar/:assetId", requireAuth(), bookingController.getCalendar);

router.get("/", requireAuth(), bookingController.getAll);
router.post("/", requireAuth(), bookingController.create);

router.get("/:id", requireAuth(), bookingController.getById);
router.patch("/:id", requireAuth(), bookingController.update);
router.post("/:id/cancel", requireAuth(), bookingController.cancel);

export default router;
