import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { requireAdmin } from "../../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAdmin());

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.post("/", categoryController.create);
router.patch("/:id", categoryController.update);
router.patch("/:id/deactivate", categoryController.deactivate);

export default router;
