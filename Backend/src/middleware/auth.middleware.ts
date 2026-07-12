import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth/index.js";
import { ForbiddenError, InactiveAccountError, UnauthorizedError } from "../utils/errors.js";
import type { Role, UserStatus } from "../types/index.js";

export const requireAuth = () =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session) {
        throw new UnauthorizedError();
      }

      const raw = session.user as typeof session.user & { role: Role; status: UserStatus };

      if (raw.status === "INACTIVE") {
        throw new InactiveAccountError();
      }

      res.locals.user = {
        ...raw,
        image: raw.image ?? null,
      };
      res.locals.session = session.session;
      next();
    } catch (err) {
      next(err);
    }
  };

export const requireRole = (...roles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await requireAuth()(req, res, (err?: unknown) => {
      if (err) return next(err);

      const user = res.locals.user;
      if (!roles.includes(user?.role as Role)) {
        return next(new ForbiddenError());
      }
      next();
    });
  };

export const requireAdmin = () => requireRole("ADMIN");
