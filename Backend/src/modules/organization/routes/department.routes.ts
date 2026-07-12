import { Router } from "express";
import { departmentController } from "../controllers/department.controller.js";
import { requireAdmin, requireRole } from "../../../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireRole("ADMIN", "ASSET_MANAGER"), departmentController.getAll);
router.get("/:id", requireRole("ADMIN", "ASSET_MANAGER"), departmentController.getById);
router.post("/", requireAdmin(), departmentController.create);
router.patch("/:id", requireAdmin(), departmentController.update);
router.patch("/:id/deactivate", requireAdmin(), departmentController.deactivate);

export default router;
