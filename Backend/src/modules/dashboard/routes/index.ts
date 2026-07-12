import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../../../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth());

// Sub-resource routes before any param routes
router.get("/kpis", dashboardController.getKpis);
router.get("/activity", dashboardController.getActivity);
router.get("/returns", dashboardController.getReturns);
router.get("/bookings", dashboardController.getBookings);
router.get("/maintenance", dashboardController.getMaintenance);
router.get("/audits", dashboardController.getAudits);

router.get("/", dashboardController.getFull);

export default router;
