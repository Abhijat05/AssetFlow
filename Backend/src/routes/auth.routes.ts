import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * GET /api/v1/auth/me
 * Returns the current authenticated user's profile.
 */
router.get("/me", requireAuth(), (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      user: res.locals.user,
    },
  });
});

export default router;
