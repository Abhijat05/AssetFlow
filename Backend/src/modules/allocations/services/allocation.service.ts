import { eq } from "drizzle-orm";
import { allocationRepository } from "../repositories/allocation.repository.js";
import { assetRepository } from "../../assets/repositories/asset.repository.js";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  AssetAlreadyAllocatedError,
} from "../../../utils/errors.js";
import { db } from "../../../db/index.js";
import { user, department } from "../../../db/schema/index.js";
import type { AllocateAssetInput, ApproveReturnInput, CreateTransferRequestInput, RejectTransferInput, AllocationQueryInput, TransferQueryInput } from "../validators/allocation.validator.js";
import type { Role } from "../../../types/index.js";

export const allocationService = {
  // ── Allocate ───────────────────────────────────────────────────────────────

  async allocate(data: AllocateAssetInput, allocatedBy: string) {
    const [foundAsset, foundEmployee, foundDept] = await Promise.all([
      assetRepository.findById(data.assetId),
      db.select({ id: user.id, name: user.name, status: user.status }).from(user).where(eq(user.id, data.employeeId)).limit(1),
      db.select({ id: department.id, name: department.name, status: department.status }).from(department).where(eq(department.id, data.departmentId)).limit(1),
    ]);

    if (!foundAsset) throw new NotFoundError("Asset not found");
    if (!foundEmployee[0]) throw new NotFoundError("Employee not found");
    if (foundEmployee[0].status === "INACTIVE") throw new ValidationError("Employee account is inactive");
    if (!foundDept[0]) throw new NotFoundError("Department not found");
    if (foundDept[0].status === "INACTIVE") throw new ValidationError("Department is inactive");

    if (foundAsset.status !== "AVAILABLE") {
      const currentAllocation = await allocationRepository.findActiveByAsset(data.assetId);
      throw new AssetAlreadyAllocatedError({
        assetStatus: foundAsset.status,
        currentAllocation: currentAllocation
          ? {
              id: currentAllocation.id,
              employeeId: currentAllocation.employeeId,
              allocatedAt: currentAllocation.allocatedAt,
              expectedReturnDate: currentAllocation.expectedReturnDate,
              status: currentAllocation.status,
            }
          : null,
        suggestion: "Create a transfer request to reassign this asset",
      });
    }

    const allocation = await allocationRepository.create({
      assetId: data.assetId,
      employeeId: data.employeeId,
      departmentId: data.departmentId,
      allocatedBy,
      expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : null,
    });

    await Promise.all([
      assetRepository.update(data.assetId, { status: "ALLOCATED" }),
      assetRepository.createHistory({
        assetId: data.assetId,
        action: "ALLOCATED",
        performedBy: allocatedBy,
        metadata: {
          allocationId: allocation.id,
          employeeId: data.employeeId,
          departmentId: data.departmentId,
          expectedReturnDate: data.expectedReturnDate ?? null,
        },
      }),
    ]);

    return allocation;
  },

  // ── Return Workflow ────────────────────────────────────────────────────────

  async requestReturn(allocationId: string, requestedBy: string, requesterRole: Role) {
    const allocation = await allocationRepository.findById(allocationId);
    if (!allocation) throw new NotFoundError("Allocation not found");

    // Employees can only request return for their own allocation
    if (requesterRole === "EMPLOYEE" && allocation.employeeId !== requestedBy)
      throw new ForbiddenError("You can only request a return for your own allocation");

    if (allocation.status !== "ACTIVE" && allocation.status !== "OVERDUE")
      throw new ValidationError(`Cannot request return for allocation with status "${allocation.status}"`);

    const updated = await allocationRepository.updateStatus(allocationId, "RETURN_REQUESTED");

    await assetRepository.createHistory({
      assetId: allocation.assetId,
      action: "RETURN_REQUESTED",
      performedBy: requestedBy,
      metadata: { allocationId },
    });

    return updated;
  },

  async approveReturn(allocationId: string, data: ApproveReturnInput, approvedBy: string) {
    const allocation = await allocationRepository.findById(allocationId);
    if (!allocation) throw new NotFoundError("Allocation not found");

    if (allocation.status !== "RETURN_REQUESTED")
      throw new ValidationError(`Allocation status is "${allocation.status}", expected RETURN_REQUESTED`);

    const updated = await allocationRepository.approveReturn(allocationId, data);

    await Promise.all([
      assetRepository.update(allocation.assetId, { status: "AVAILABLE" }),
      assetRepository.createHistory({
        assetId: allocation.assetId,
        action: "RETURNED",
        performedBy: approvedBy,
        metadata: {
          allocationId,
          returnCondition: data.returnCondition,
          returnNotes: data.returnNotes ?? null,
        },
      }),
    ]);

    return updated;
  },

  // ── Transfer Requests ──────────────────────────────────────────────────────

  async createTransferRequest(
    data: CreateTransferRequestInput,
    requestedBy: string,
    requesterRole: Role
  ) {
    const foundAsset = await assetRepository.findById(data.assetId);
    if (!foundAsset) throw new NotFoundError("Asset not found");

    const activeAllocation = await allocationRepository.findActiveByAsset(data.assetId);

    // Employees must be the current holder to request a transfer
    if (requesterRole === "EMPLOYEE") {
      if (!activeAllocation || activeAllocation.employeeId !== requestedBy)
        throw new ForbiddenError("You can only request transfers for assets currently allocated to you");
    }

    if (!activeAllocation)
      throw new ValidationError("Asset has no active allocation to transfer");

    if (activeAllocation.status === "TRANSFER_PENDING")
      throw new ValidationError("A transfer request is already pending for this asset");

    if (activeAllocation.status === "RETURN_REQUESTED")
      throw new ValidationError("A return has already been requested for this asset");

    if (data.requestedEmployeeId) {
      const targetEmployee = await db
        .select({ id: user.id, status: user.status })
        .from(user)
        .where(eq(user.id, data.requestedEmployeeId))
        .limit(1);
      if (!targetEmployee[0]) throw new NotFoundError("Target employee not found");
      if (targetEmployee[0].status === "INACTIVE")
        throw new ValidationError("Target employee account is inactive");
    }

    if (data.requestedDepartmentId) {
      const targetDept = await db
        .select({ id: department.id, status: department.status })
        .from(department)
        .where(eq(department.id, data.requestedDepartmentId))
        .limit(1);
      if (!targetDept[0]) throw new NotFoundError("Target department not found");
      if (targetDept[0].status === "INACTIVE")
        throw new ValidationError("Target department is inactive");
    }

    const [transfer] = await Promise.all([
      allocationRepository.createTransfer({
        assetId: data.assetId,
        requestedBy,
        currentHolderId: activeAllocation.employeeId,
        requestedEmployeeId: data.requestedEmployeeId ?? null,
        requestedDepartmentId: data.requestedDepartmentId ?? null,
        reason: data.reason ?? null,
      }),
      allocationRepository.updateStatus(activeAllocation.id, "TRANSFER_PENDING"),
    ]);

    await assetRepository.createHistory({
      assetId: data.assetId,
      action: "TRANSFER_REQUESTED",
      performedBy: requestedBy,
      metadata: {
        transferId: transfer.id,
        requestedEmployeeId: data.requestedEmployeeId ?? null,
        requestedDepartmentId: data.requestedDepartmentId ?? null,
        reason: data.reason ?? null,
      },
    });

    return transfer;
  },

  async approveTransfer(
    transferId: string,
    approver: { id: string; role: Role }
  ) {
    const transfer = await allocationRepository.findTransferById(transferId);
    if (!transfer) throw new NotFoundError("Transfer request not found");
    if (transfer.status !== "PENDING")
      throw new ValidationError(`Transfer request status is "${transfer.status}", expected PENDING`);

    // DEPARTMENT_HEAD can only approve for assets in their own department
    if (approver.role === "DEPARTMENT_HEAD") {
      const foundAsset = await assetRepository.findById(transfer.assetId);
      const approverRecord = await db
        .select({ departmentId: user.departmentId })
        .from(user)
        .where(eq(user.id, approver.id))
        .limit(1);

      if (!foundAsset || !approverRecord[0]?.departmentId)
        throw new ForbiddenError("Cannot determine your department");

      if (foundAsset.departmentId !== approverRecord[0].departmentId)
        throw new ForbiddenError("You can only approve transfers for assets in your department");
    }

    const currentAllocation = await allocationRepository.findActiveByAsset(transfer.assetId);
    if (!currentAllocation)
      throw new NotFoundError("No active allocation found for this asset");

    // Resolve target dept: use requested or fall back to asset's current dept
    const foundAsset = await assetRepository.findById(transfer.assetId);
    const newDeptId = transfer.requestedDepartmentId ?? currentAllocation.departmentId;
    const newEmployeeId = transfer.requestedEmployeeId ?? currentAllocation.employeeId;

    // Close old allocation
    await allocationRepository.updateStatus(currentAllocation.id, "TRANSFERRED");

    // Create new allocation
    const newAllocation = await allocationRepository.create({
      assetId: transfer.assetId,
      employeeId: newEmployeeId,
      departmentId: newDeptId,
      allocatedBy: approver.id,
      expectedReturnDate: null,
    });

    // Approve transfer request + update asset's registered department if changed
    const updates: Promise<unknown>[] = [
      allocationRepository.updateTransferStatus(transferId, "APPROVED", approver.id),
      assetRepository.createHistory({
        assetId: transfer.assetId,
        action: "TRANSFER_APPROVED",
        performedBy: approver.id,
        metadata: {
          transferId,
          fromEmployee: transfer.currentHolderId,
          toEmployee: newEmployeeId,
          toDepartment: newDeptId,
          newAllocationId: newAllocation.id,
        },
      }),
    ];

    if (foundAsset && foundAsset.departmentId !== newDeptId)
      updates.push(assetRepository.update(transfer.assetId, { departmentId: newDeptId }));

    await Promise.all(updates);

    return newAllocation;
  },

  async rejectTransfer(
    transferId: string,
    data: RejectTransferInput,
    rejectedBy: string
  ) {
    const transfer = await allocationRepository.findTransferById(transferId);
    if (!transfer) throw new NotFoundError("Transfer request not found");
    if (transfer.status !== "PENDING")
      throw new ValidationError(`Transfer request status is "${transfer.status}", expected PENDING`);

    const currentAllocation = await allocationRepository.findActiveByAsset(transfer.assetId);

    await Promise.all([
      allocationRepository.updateTransferStatus(transferId, "REJECTED"),
      // Revert allocation from TRANSFER_PENDING → ACTIVE
      ...(currentAllocation?.status === "TRANSFER_PENDING"
        ? [allocationRepository.updateStatus(currentAllocation.id, "ACTIVE")]
        : []),
      assetRepository.createHistory({
        assetId: transfer.assetId,
        action: "TRANSFER_REJECTED",
        performedBy: rejectedBy,
        metadata: { transferId, reason: data.reason ?? null },
      }),
    ]);
  },

  async cancelTransfer(
    transferId: string,
    cancelledBy: string,
    cancellerRole: Role
  ) {
    const transfer = await allocationRepository.findTransferById(transferId);
    if (!transfer) throw new NotFoundError("Transfer request not found");
    if (transfer.status !== "PENDING")
      throw new ValidationError(`Transfer request status is "${transfer.status}", expected PENDING`);

    // Employees can only cancel their own transfer requests
    if (cancellerRole === "EMPLOYEE" && transfer.requestedBy !== cancelledBy)
      throw new ForbiddenError("You can only cancel your own transfer requests");

    const currentAllocation = await allocationRepository.findActiveByAsset(transfer.assetId);

    await Promise.all([
      allocationRepository.updateTransferStatus(transferId, "CANCELLED"),
      ...(currentAllocation?.status === "TRANSFER_PENDING"
        ? [allocationRepository.updateStatus(currentAllocation.id, "ACTIVE")]
        : []),
      assetRepository.createHistory({
        assetId: transfer.assetId,
        action: "TRANSFER_CANCELLED",
        performedBy: cancelledBy,
        metadata: { transferId },
      }),
    ]);
  },

  // ── Queries ────────────────────────────────────────────────────────────────

  async getAll(query: AllocationQueryInput) {
    const { rows, total } = await allocationRepository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);
    return { data: rows, meta: { total, page: query.page, limit: query.limit, totalPages } };
  },

  async getById(id: string, requesterId: string, requesterRole: Role) {
    const allocation = await allocationRepository.findById(id);
    if (!allocation) throw new NotFoundError("Allocation not found");

    // Employees can only view their own allocations
    if (requesterRole === "EMPLOYEE" && allocation.employeeId !== requesterId)
      throw new ForbiddenError("You do not have access to this allocation");

    return allocation;
  },

  async getMyAllocations(employeeId: string, query: AllocationQueryInput) {
    const { rows, total } = await allocationRepository.findByEmployee(employeeId, query);
    const totalPages = Math.ceil(total / query.limit);
    return { data: rows, meta: { total, page: query.page, limit: query.limit, totalPages } };
  },

  async getOverdue() {
    await allocationRepository.markOverdue();
    return allocationRepository.findOverdue();
  },

  async getAllTransfers(query: TransferQueryInput) {
    const { rows, total } = await allocationRepository.findTransfers(query);
    const totalPages = Math.ceil(total / query.limit);
    return { data: rows, meta: { total, page: query.page, limit: query.limit, totalPages } };
  },

  async getTransferById(id: string, requesterId: string, requesterRole: Role) {
    const transfer = await allocationRepository.findTransferById(id);
    if (!transfer) throw new NotFoundError("Transfer request not found");

    if (
      requesterRole === "EMPLOYEE" &&
      transfer.requestedBy !== requesterId &&
      transfer.currentHolderId !== requesterId
    )
      throw new ForbiddenError("You do not have access to this transfer request");

    return transfer;
  },
};
