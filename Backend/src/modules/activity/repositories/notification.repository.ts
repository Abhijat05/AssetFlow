import { eq, and, gte, lte, desc, isNull, lte as lteOp, SQL } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { notification, assetAllocation, booking, asset, user } from "../../../db/schema/index.js";
import type { NotificationInput, NotificationType, NotificationPriority } from "../types/index.js";
import type { NotificationQueryInput } from "../validators/activity.validator.js";
import type { Role } from "../../../types/index.js";

const generateId = () => crypto.randomUUID();

export const notificationRepository = {
  async create(data: NotificationInput) {
    const [row] = await db
      .insert(notification)
      .values({
        id: generateId(),
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority ?? "MEDIUM",
        referenceType: data.referenceType ?? null,
        referenceId: data.referenceId ?? null,
        isRead: false,
        readAt: null,
      })
      .returning();
    return row;
  },

  async findAll(filters: NotificationQueryInput, userId: string, role: Role) {
    const conds: SQL[] = [];

    // ADMIN can see all; others only their own
    if (role !== "ADMIN") {
      conds.push(eq(notification.userId, userId));
    }

    if (filters.type) conds.push(eq(notification.type, filters.type as NotificationType));
    if (filters.priority) conds.push(eq(notification.priority, filters.priority as NotificationPriority));
    if (filters.isRead !== undefined) conds.push(eq(notification.isRead, filters.isRead));
    if (filters.dateFrom) conds.push(gte(notification.createdAt, new Date(filters.dateFrom)));
    if (filters.dateTo) conds.push(lte(notification.createdAt, new Date(filters.dateTo)));

    const where = conds.length ? and(...conds) : undefined;
    const offset = (filters.page - 1) * filters.limit;

    return db
      .select()
      .from(notification)
      .where(where)
      .orderBy(desc(notification.createdAt))
      .limit(filters.limit)
      .offset(offset);
  },

  async findById(id: string, userId: string, role: Role) {
    const conds: SQL[] = [eq(notification.id, id)];
    if (role !== "ADMIN") conds.push(eq(notification.userId, userId));

    const rows = await db
      .select()
      .from(notification)
      .where(and(...conds))
      .limit(1);
    return rows[0] ?? null;
  },

  async markRead(id: string, userId: string, role: Role) {
    const conds: SQL[] = [eq(notification.id, id), eq(notification.isRead, false)];
    if (role !== "ADMIN") conds.push(eq(notification.userId, userId));

    const [updated] = await db
      .update(notification)
      .set({ isRead: true, readAt: new Date() })
      .where(and(...conds))
      .returning();
    return updated ?? null;
  },

  async markAllRead(userId: string) {
    await db
      .update(notification)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notification.userId, userId), eq(notification.isRead, false)));
  },

  async deleteOne(id: string, userId: string, role: Role) {
    const conds: SQL[] = [eq(notification.id, id)];
    if (role !== "ADMIN") conds.push(eq(notification.userId, userId));

    const [deleted] = await db
      .delete(notification)
      .where(and(...conds))
      .returning();
    return deleted ?? null;
  },

  async unreadCount(userId: string, role: Role) {
    const conds: SQL[] = [eq(notification.isRead, false)];
    if (role !== "ADMIN") conds.push(eq(notification.userId, userId));

    const rows = await db
      .select({ id: notification.id })
      .from(notification)
      .where(and(...conds));
    return rows.length;
  },

  async overdueAllocations(userId: string, role: Role) {
    const conds: SQL[] = [eq(assetAllocation.status, "OVERDUE")];

    if (role === "EMPLOYEE") {
      conds.push(eq(assetAllocation.employeeId, userId));
    }

    const rows = await db
      .select({
        allocationId: assetAllocation.id,
        assetId: asset.id,
        assetTag: asset.assetTag,
        assetName: asset.name,
        employeeId: assetAllocation.employeeId,
        employeeName: user.name,
        expectedReturnDate: assetAllocation.expectedReturnDate,
        allocatedAt: assetAllocation.allocatedAt,
      })
      .from(assetAllocation)
      .innerJoin(asset, eq(assetAllocation.assetId, asset.id))
      .innerJoin(user, eq(assetAllocation.employeeId, user.id))
      .where(and(...conds))
      .orderBy(assetAllocation.expectedReturnDate);

    return rows;
  },

  async upcomingBookingAlerts(userId: string, role: Role) {
    const now = new Date();
    const in30min = new Date(now.getTime() + 30 * 60 * 1000);

    const conds: SQL[] = [
      eq(booking.status, "UPCOMING"),
      gte(booking.startTime, now),
      lteOp(booking.startTime, in30min),
    ];

    if (role === "EMPLOYEE" || role === "DEPARTMENT_HEAD") {
      conds.push(eq(booking.bookedBy, userId));
    }

    const rows = await db
      .select({
        bookingId: booking.id,
        title: booking.title,
        purpose: booking.purpose,
        assetId: asset.id,
        assetTag: asset.assetTag,
        assetName: asset.name,
        bookedBy: booking.bookedBy,
        bookerName: user.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
      })
      .from(booking)
      .innerJoin(asset, eq(booking.assetId, asset.id))
      .innerJoin(user, eq(booking.bookedBy, user.id))
      .where(and(...conds))
      .orderBy(booking.startTime);

    return rows;
  },
};
