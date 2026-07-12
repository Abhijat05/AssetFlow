import { Router } from "express";
import { employeeController } from "../controllers/employee.controller.js";
import { requireAdmin } from "../../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAdmin());

router.get("/", employeeController.getAll);
router.get("/:id", employeeController.getById);
router.patch("/:id/department", employeeController.updateDepartment);
router.patch("/:id/role", employeeController.updateRole);
router.patch("/:id/status", employeeController.updateStatus);

export default router;
