import { Router } from "express";
import authRoutes from "./auth.routes.js";
import organizationRoutes from "../modules/organization/routes/index.js";
import assetRoutes from "../modules/assets/routes/index.js";
import allocationRoutes from "../modules/allocations/routes/index.js";
import bookingRoutes from "../modules/bookings/routes/index.js";
import maintenanceRoutes from "../modules/maintenance/routes/index.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/organization", organizationRoutes);
router.use("/assets", assetRoutes);
router.use("/allocations", allocationRoutes);
router.use("/bookings", bookingRoutes);
router.use("/maintenance", maintenanceRoutes);

export default router;
