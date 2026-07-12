import { Router } from "express";
import { requireAuth, requireRole } from "../../../middleware/auth.middleware.js";
import { reportController } from "../controllers/report.controller.js";

const router = Router();

const allowedRoles = requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD");

router.use(requireAuth());
router.use(allowedRoles);

router.get("/utilization", reportController.getUtilization);
router.get("/maintenance", reportController.getMaintenance);
router.get("/lifecycle", reportController.getLifecycle);
router.get("/departments", reportController.getDepartments);
router.get("/bookings", reportController.getBookings);
router.get("/audits", reportController.getAudits);
router.get("/export", reportController.exportReport);

export default router;
