import { Router } from "express";
import authRoutes from "./auth.routes.js";
import organizationRoutes from "../modules/organization/routes/index.js";
import assetRoutes from "../modules/assets/routes/index.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/organization", organizationRoutes);
router.use("/assets", assetRoutes);

export default router;
