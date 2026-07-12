import { Router } from "express";
import departmentRoutes from "./department.routes.js";
import categoryRoutes from "./category.routes.js";
import employeeRoutes from "./employee.routes.js";

const router = Router();

router.use("/departments", departmentRoutes);
router.use("/categories", categoryRoutes);
router.use("/employees", employeeRoutes);

export default router;
