import { Router } from "express";
import { auditController } from "../controllers/audit.controller.js";
import { requireAuth, requireRole } from "../../../middleware/auth.middleware.js";

const router = Router();

const adminOnly = requireRole("ADMIN");
const canRead = requireRole("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD");
const canManage = requireRole("ADMIN", "ASSET_MANAGER");

// ── Collection routes ──────────────────────────────────────────────────────
router.get("/", canRead, auditController.getAll);
router.post("/", adminOnly, auditController.create);

// ── Sub-resource routes before /:id to avoid param capture ────────────────
// (none here — all sub-routes are nested under /:id)

// ── Single-resource routes ─────────────────────────────────────────────────
router.get("/:id", canRead, auditController.getById);
router.patch("/:id", adminOnly, auditController.update);
router.post("/:id/auditors", adminOnly, auditController.assignAuditors);
router.post("/:id/close", adminOnly, auditController.close);

// Discrepancy report — ADMIN and ASSET_MANAGER only
router.get("/:id/discrepancy-report", canManage, auditController.getDiscrepancyReport);

// Verify asset — any non-EMPLOYEE role; auditor assignment enforced in service
router.post("/:id/verify/:assetId", canRead, auditController.verifyAsset);

export default router;
