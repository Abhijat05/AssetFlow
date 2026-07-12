import type { Request, Response, NextFunction } from "express";
import { allocationService } from "../services/allocation.service.js";
import {
  allocateAssetSchema,
  approveReturnSchema,
  createTransferRequestSchema,
  rejectTransferSchema,
  allocationQuerySchema,
  transferQuerySchema,
} from "../validators/allocation.validator.js";
import { AssetAlreadyAllocatedError } from "../../../utils/errors.js";
import type { Role } from "../../../types/index.js";

export const allocationController = {
  // ── Allocations ────────────────────────────────────────────────────────────

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = allocationQuerySchema.parse(req.query);
      const result = await allocationService.getAll(query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getMyAllocations(req: Request, res: Response, next: NextFunction) {
    try {
      const query = allocationQuerySchema.parse(req.query);
      const employeeId = res.locals.user.id as string;
      const result = await allocationService.getMyAllocations(employeeId, query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getOverdue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await allocationService.getOverdue();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const { id: requesterId, role } = res.locals.user;
      const data = await allocationService.getById(id, requesterId, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async allocate(req: Request, res: Response, next: NextFunction) {
    try {
      const body = allocateAssetSchema.parse(req.body);
      const allocatedBy = res.locals.user.id as string;
      const data = await allocationService.allocate(body, allocatedBy);
      res.status(201).json({ success: true, data });
    } catch (err) {
      if (err instanceof AssetAlreadyAllocatedError) {
        res.status(409).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
            currentAllocation: err.currentAllocation,
          },
        });
        return;
      }
      next(err);
    }
  },

  async requestReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const { id: requestedBy, role } = res.locals.user;
      const data = await allocationService.requestReturn(id, requestedBy, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async approveReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = approveReturnSchema.parse(req.body);
      const approvedBy = res.locals.user.id as string;
      const data = await allocationService.approveReturn(id, body, approvedBy);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // ── Transfer Requests ──────────────────────────────────────────────────────

  async getAllTransfers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = transferQuerySchema.parse(req.query);
      const result = await allocationService.getAllTransfers(query);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getTransferById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const { id: requesterId, role } = res.locals.user;
      const data = await allocationService.getTransferById(id, requesterId, role as Role);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createTransferRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createTransferRequestSchema.parse(req.body);
      const { id: requestedBy, role } = res.locals.user;
      const data = await allocationService.createTransferRequest(body, requestedBy, role as Role);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async approveTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const { id: approverId, role } = res.locals.user;
      const data = await allocationService.approveTransfer(id, { id: approverId, role: role as Role });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async rejectTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const body = rejectTransferSchema.parse(req.body);
      const rejectedBy = res.locals.user.id as string;
      await allocationService.rejectTransfer(id, body, rejectedBy);
      res.json({ success: true, message: "Transfer request rejected" });
    } catch (err) {
      next(err);
    }
  },

  async cancelTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const { id: cancelledBy, role } = res.locals.user;
      await allocationService.cancelTransfer(id, cancelledBy, role as Role);
      res.json({ success: true, message: "Transfer request cancelled" });
    } catch (err) {
      next(err);
    }
  },
};
