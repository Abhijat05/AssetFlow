import { Router } from "express";
import multer from "multer";
import { maintenanceController } from "../controllers/maintenance.controller.js";
import { requireAuth, requireRole } from "../../../middleware/auth.middleware.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

const canManage = requireRole("ADMIN", "ASSET_MANAGER");

// All authenticated users can list and create; scoping is handled in the service
router.get("/", requireAuth(), maintenanceController.getAll);
router.post("/", requireAuth(), maintenanceController.create);

// Workflow actions — ADMIN and ASSET_MANAGER only
// These must be defined before /:id so Express matches them first
router.patch("/:id/approve", canManage, maintenanceController.approve);
router.patch("/:id/reject", canManage, maintenanceController.reject);
router.patch("/:id/assign-technician", canManage, maintenanceController.assignTechnician);
router.patch("/:id/start", canManage, maintenanceController.start);
router.patch("/:id/resolve", canManage, maintenanceController.resolve);

// Attachments
router.post(
  "/:id/attachments",
  requireAuth(),
  upload.single("file"),
  maintenanceController.uploadAttachment
);
router.delete(
  "/:id/attachments/:attachmentId",
  canManage,
  maintenanceController.deleteAttachment
);

// Single record — any authenticated user (scoped in service)
router.get("/:id", requireAuth(), maintenanceController.getById);

export default router;
