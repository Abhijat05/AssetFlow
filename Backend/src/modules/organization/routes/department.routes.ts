import { Router } from "express";
import { departmentController } from "../controllers/department.controller.js";
import { requireAdmin } from "../../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAdmin());

router.get("/", departmentController.getAll);
router.get("/:id", departmentController.getById);
router.post("/", departmentController.create);
router.patch("/:id", departmentController.update);
router.patch("/:id/deactivate", departmentController.deactivate);

export default router;
