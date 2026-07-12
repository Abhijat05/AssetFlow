import { Router } from "express";
import authRoutes from "./auth.routes.js";
import organizationRoutes from "../modules/organization/routes/index.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/organization", organizationRoutes);

export default router;
