import { Router } from "express";
import { allocationController } from "../controllers/allocation.controller.js";
import { requireAuth, requireRole } from "../../../middleware/auth.middleware.js";

const router = Router();

const canWrite = requireRole("ADMIN", "ASSET_MANAGER");
const canRead = requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD");

// ── All static / sub-resource routes BEFORE /:id ────────────────────────────

// Overdue list — ADMIN / ASSET_MANAGER only
router.get("/overdue", canWrite, allocationController.getOverdue);

// Own allocations — any authenticated user
router.get("/my", requireAuth(), allocationController.getMyAllocations);

// Transfer request sub-resource (must precede /:id)
router.get("/transfers", canRead, allocationController.getAllTransfers);
router.post("/transfers", requireAuth(), allocationController.createTransferRequest);
router.get("/transfers/:id", requireAuth(), allocationController.getTransferById);
router.post(
  "/transfers/:id/approve",
  requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"),
  allocationController.approveTransfer
);
router.post("/transfers/:id/reject", canWrite, allocationController.rejectTransfer);
router.post("/transfers/:id/cancel", requireAuth(), allocationController.cancelTransfer);

// ── Root + parameterized allocation routes ───────────────────────────────────

router.get("/", canRead, allocationController.getAll);
router.post("/", canWrite, allocationController.allocate);

router.get("/:id", requireAuth(), allocationController.getById);
router.post("/:id/return-request", requireAuth(), allocationController.requestReturn);
router.post("/:id/approve-return", canWrite, allocationController.approveReturn);

export default router;
