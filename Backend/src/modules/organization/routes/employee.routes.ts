import { Router } from "express";
import { employeeController } from "../controllers/employee.controller.js";
import { requireAdmin, requireRole } from "../../../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), employeeController.getAll);
router.get("/:id", requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), employeeController.getById);
router.patch("/:id/department", requireRole("ADMIN", "ASSET_MANAGER"), employeeController.updateDepartment);
router.patch("/:id/role", requireAdmin(), employeeController.updateRole);
router.patch("/:id/status", requireAdmin(), employeeController.updateStatus);

export default router;
