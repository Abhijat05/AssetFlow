import { Router } from "express";
import multer from "multer";
import { assetController } from "../controllers/asset.controller.js";
import { requireRole } from "../../../middleware/auth.middleware.js";

const router = Router();

// Memory storage — files are uploaded straight to Supabase, no disk writes
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD — read-only access
const canRead = requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD");
// ADMIN, ASSET_MANAGER — full write access
const canWrite = requireRole("ADMIN", "ASSET_MANAGER");

router.get("/", canRead, assetController.getAll);
router.get("/:id", canRead, assetController.getById);
router.post("/", canWrite, assetController.create);
router.patch("/:id", canWrite, assetController.update);
router.patch("/:id/archive", canWrite, assetController.archive);

// Attachments
router.post("/:id/attachments", canWrite, upload.single("file"), assetController.uploadAttachment);
router.delete("/:id/attachments/:attachmentId", canWrite, assetController.deleteAttachment);

export default router;
