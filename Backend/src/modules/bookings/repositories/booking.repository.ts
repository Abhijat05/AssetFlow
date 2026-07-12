import { eq, and, lt, gt, ne, gte, lte, inArray, asc, desc, count, SQL } from "drizzle-orm";
import { aliasedTable } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { booking, asset, user, department } from "../../../db/schema/index.js";
import type { BookingStatus } from "../types/index.js";
import type { BookingQueryInput, CalendarQueryInput } from "../validators/booking.validator.js";

const generateId = () => crypto.randomUUID();

export const bookingRepository = {
  async findById(id: string) {
    const rows = await db.select().from(booking).where(eq(booking.id, id)).limit(1);
    return rows[0] ?? null;
  },

  // Check for any active (non-cancelled) booking that overlaps [startTime, endTime)
  // Overlap condition: existing.startTime < newEnd AND existing.endTime > newStart
  async findOverlap(assetId: string, startTime: Date, endTime: Date, excludeId?: string) {
    const conditions: SQL[] = [
      eq(booking.assetId, assetId),
      ne(booking.status, "CANCELLED"),
      lt(booking.startTime, endTime),
      gt(booking.endTime, startTime),
    ];
    if (excludeId) conditions.push(ne(booking.id, excludeId));

    const rows = await db
      .select({
        id: booking.id,
        title: booking.title,
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookedBy: booking.bookedBy,
      })
      .from(booking)
      .where(and(...conditions))
      .limit(1);

    return rows[0] ?? null;
  },

  async findAll(query: BookingQueryInput) {
    const { assetId, bookedBy, departmentId, status, startFrom, startTo, page, limit, sortBy, sortOrder } = query;

    const booker = aliasedTable(user, "booker");

    const conditions: SQL[] = [];
    if (assetId) conditions.push(eq(booking.assetId, assetId));
    if (bookedBy) conditions.push(eq(booking.bookedBy, bookedBy));
    if (departmentId) conditions.push(eq(booking.departmentId, departmentId));
    if (status) conditions.push(eq(booking.status, status));
    if (startFrom) conditions.push(gte(booking.startTime, new Date(startFrom)));
    if (startTo) conditions.push(lte(booking.startTime, new Date(startTo)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumn = {
      startTime: booking.startTime,
      endTime: booking.endTime,
      createdAt: booking.createdAt,
      title: booking.title,
    }[sortBy];

    const orderBy = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);
    const offset = (page - 1) * limit;

    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select({
          booking: booking,
          assetName: asset.name,
          assetTag: asset.assetTag,
          bookerName: booker.name,
          bookerEmail: booker.email,
          departmentName: department.name,
        })
        .from(booking)
        .leftJoin(asset, eq(booking.assetId, asset.id))
        .leftJoin(booker, eq(booking.bookedBy, booker.id))
        .leftJoin(department, eq(booking.departmentId, department.id))
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(booking).where(where),
    ]);

    return { rows, total: Number(total) };
  },

  async findCalendar(assetId: string, query: CalendarQueryInput) {
    const booker = aliasedTable(user, "booker");

    const conditions: SQL[] = [
      eq(booking.assetId, assetId),
      ne(booking.status, "CANCELLED"),
    ];
    if (query.from) conditions.push(gte(booking.endTime, new Date(query.from)));
    if (query.to) conditions.push(lte(booking.startTime, new Date(query.to)));

    return db
      .select({
        booking: booking,
        bookerName: booker.name,
        departmentName: department.name,
      })
      .from(booking)
      .leftJoin(booker, eq(booking.bookedBy, booker.id))
      .leftJoin(department, eq(booking.departmentId, department.id))
      .where(and(...conditions))
      .orderBy(asc(booking.startTime));
  },

  async create(data: {
    assetId: string;
    bookedBy: string;
    departmentId: string;
    title: string;
    purpose?: string | null;
    startTime: Date;
    endTime: Date;
    status: BookingStatus;
  }) {
    const now = new Date();
    const [created] = await db
      .insert(booking)
      .values({
        id: generateId(),
        assetId: data.assetId,
        bookedBy: data.bookedBy,
        departmentId: data.departmentId,
        title: data.title,
        purpose: data.purpose ?? null,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        cancelReason: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  },

  async update(id: string, data: {
    title?: string;
    purpose?: string | null;
    startTime?: Date;
    endTime?: Date;
    status?: BookingStatus;
  }) {
    const values: Partial<typeof booking.$inferInsert> = { updatedAt: new Date() };
    if (data.title !== undefined) values.title = data.title;
    if (data.purpose !== undefined) values.purpose = data.purpose ?? null;
    if (data.startTime !== undefined) values.startTime = data.startTime;
    if (data.endTime !== undefined) values.endTime = data.endTime;
    if (data.status !== undefined) values.status = data.status;

    const [updated] = await db.update(booking).set(values).where(eq(booking.id, id)).returning();
    return updated;
  },

  async cancel(id: string, cancelReason: string | null) {
    const [updated] = await db
      .update(booking)
      .set({ status: "CANCELLED", cancelReason, updatedAt: new Date() })
      .where(eq(booking.id, id))
      .returning();
    return updated;
  },

  // Bulk-sync stale UPCOMING → ONGOING and ONGOING → COMPLETED based on current time
  async syncStatuses(): Promise<void> {
    const now = new Date();
    await Promise.all([
      // UPCOMING → ONGOING (start has passed but end hasn't)
      db
        .update(booking)
        .set({ status: "ONGOING", updatedAt: now })
        .where(
          and(
            eq(booking.status, "UPCOMING"),
            lte(booking.startTime, now),
            gt(booking.endTime, now)
          )
        ),
      // ONGOING → COMPLETED (end has passed)
      db
        .update(booking)
        .set({ status: "COMPLETED", updatedAt: now })
        .where(
          and(
            inArray(booking.status, ["UPCOMING", "ONGOING"]),
            lte(booking.endTime, now)
          )
        ),
    ]);
  },
};
