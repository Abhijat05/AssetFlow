import { eq } from "drizzle-orm";
import { bookingRepository } from "../repositories/booking.repository.js";
import { assetRepository } from "../../assets/repositories/asset.repository.js";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
} from "../../../utils/errors.js";
import { db } from "../../../db/index.js";
import { department } from "../../../db/schema/index.js";
import { deriveStatus } from "../types/index.js";
import type {
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
  BookingQueryInput,
  CalendarQueryInput,
} from "../validators/booking.validator.js";
import type { Role } from "../../../types/index.js";

// Asset statuses that block booking
const UNbookable_STATUSES = new Set([
  "ALLOCATED",
  "UNDER_MAINTENANCE",
  "LOST",
  "RETIRED",
  "DISPOSED",
]);

export const bookingService = {
  async create(data: CreateBookingInput, bookedBy: string) {
    const foundAsset = await assetRepository.findById(data.assetId);
    if (!foundAsset) throw new NotFoundError("Asset not found");
    if (!foundAsset.isBookable) throw new ValidationError("Asset is not bookable");
    if (UNbookable_STATUSES.has(foundAsset.status))
      throw new ValidationError(`Asset cannot be booked — current status is ${foundAsset.status}`);

    const foundDept = await db
      .select({ id: department.id, status: department.status })
      .from(department)
      .where(eq(department.id, data.departmentId))
      .limit(1);
    if (!foundDept[0]) throw new NotFoundError("Department not found");
    if (foundDept[0].status === "INACTIVE") throw new ValidationError("Department is inactive");

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    const overlap = await bookingRepository.findOverlap(data.assetId, startTime, endTime);
    if (overlap)
      throw new ConflictError(
        `Booking conflicts with an existing booking "${overlap.title}" (${overlap.startTime.toISOString()} – ${overlap.endTime.toISOString()})`
      );

    const status = deriveStatus(startTime, endTime);

    const created = await bookingRepository.create({
      assetId: data.assetId,
      bookedBy,
      departmentId: data.departmentId,
      title: data.title,
      purpose: data.purpose ?? null,
      startTime,
      endTime,
      status,
    });

    await assetRepository.createHistory({
      assetId: data.assetId,
      action: "BOOKING_CREATED",
      performedBy: bookedBy,
      metadata: {
        bookingId: created.id,
        title: data.title,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      },
    });

    return created;
  },

  async update(
    id: string,
    data: UpdateBookingInput,
    requesterId: string,
    requesterRole: Role
  ) {
    const existing = await bookingRepository.findById(id);
    if (!existing) throw new NotFoundError("Booking not found");

    this._assertCanModify(existing, requesterId, requesterRole);

    if (existing.status !== "UPCOMING")
      throw new ValidationError("Booking can only be updated before it starts");

    const startTime = data.startTime ? new Date(data.startTime) : existing.startTime;
    const endTime = data.endTime ? new Date(data.endTime) : existing.endTime;

    if (endTime <= startTime)
      throw new ValidationError("End time must be after start time");

    if (data.startTime || data.endTime) {
      const overlap = await bookingRepository.findOverlap(
        existing.assetId,
        startTime,
        endTime,
        id
      );
      if (overlap)
        throw new ConflictError(
          `Booking conflicts with an existing booking "${overlap.title}" (${overlap.startTime.toISOString()} – ${overlap.endTime.toISOString()})`
        );
    }

    const updated = await bookingRepository.update(id, {
      title: data.title,
      purpose: data.purpose,
      startTime: data.startTime ? startTime : undefined,
      endTime: data.endTime ? endTime : undefined,
    });

    await assetRepository.createHistory({
      assetId: existing.assetId,
      action: "BOOKING_UPDATED",
      performedBy: requesterId,
      metadata: { bookingId: id, changes: data },
    });

    return updated;
  },

  async cancel(
    id: string,
    data: CancelBookingInput,
    requesterId: string,
    requesterRole: Role
  ) {
    const existing = await bookingRepository.findById(id);
    if (!existing) throw new NotFoundError("Booking not found");

    this._assertCanModify(existing, requesterId, requesterRole);

    if (existing.status === "CANCELLED")
      throw new ValidationError("Booking is already cancelled");
    if (existing.status === "COMPLETED")
      throw new ValidationError("A completed booking cannot be cancelled");

    const cancelled = await bookingRepository.cancel(id, data.cancelReason ?? null);

    await assetRepository.createHistory({
      assetId: existing.assetId,
      action: "BOOKING_CANCELLED",
      performedBy: requesterId,
      metadata: {
        bookingId: id,
        cancelReason: data.cancelReason ?? null,
        previousStatus: existing.status,
      },
    });

    return cancelled;
  },

  async getById(id: string) {
    await bookingRepository.syncStatuses();
    const found = await bookingRepository.findById(id);
    if (!found) throw new NotFoundError("Booking not found");
    return found;
  },

  async getAll(query: BookingQueryInput) {
    await bookingRepository.syncStatuses();
    const { rows, total } = await bookingRepository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);
    return { data: rows, meta: { total, page: query.page, limit: query.limit, totalPages } };
  },

  async getCalendar(assetId: string, query: CalendarQueryInput) {
    const foundAsset = await assetRepository.findById(assetId);
    if (!foundAsset) throw new NotFoundError("Asset not found");
    if (!foundAsset.isBookable) throw new ValidationError("Asset is not bookable");

    await bookingRepository.syncStatuses();
    return bookingRepository.findCalendar(assetId, query);
  },

  // ── Internal helpers ───────────────────────────────────────────────────────

  _assertCanModify(
    record: { bookedBy: string },
    requesterId: string,
    requesterRole: Role
  ) {
    if (requesterRole === "ADMIN" || requesterRole === "ASSET_MANAGER" || requesterRole === "DEPARTMENT_HEAD")
      return;
    // EMPLOYEE: own bookings only
    if (record.bookedBy !== requesterId)
      throw new ForbiddenError("You can only modify your own bookings");
  },
};
