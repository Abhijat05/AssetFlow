import type { Request, Response } from "express";
import { logRepository } from "../repositories/log.repository.js";
import { logQuerySchema } from "../validators/activity.validator.js";
import { NotFoundError, ForbiddenError } from "../../../utils/errors.js";
import type { Role } from "../../../types/index.js";

export const logController = {
  async getLogs(req: Request, res: Response) {
    const { id: userId, role } = res.locals.user as { id: string; role: Role };

    const result = logQuerySchema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error.issues.map((i) => i.message) });
      return;
    }

    const logs = await logRepository.findAll(result.data, role, userId);
    res.json({ success: true, data: logs });
  },

  async getLog(req: Request, res: Response) {
    const { id: userId, role } = res.locals.user as { id: string; role: Role };
    const log = await logRepository.findById(req.params.id as string);

    if (!log) throw new NotFoundError("Log not found");

    // EMPLOYEE can only see their own logs
    if (role === "EMPLOYEE" && log.userId !== userId) {
      throw new ForbiddenError();
    }

    res.json({ success: true, data: log });
  },
};
