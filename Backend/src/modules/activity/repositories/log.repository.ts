import { eq, and, gte, lte, ilike, or, desc, SQL } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { activityLog, user } from "../../../db/schema/index.js";
import type { LogInput, ActivityModule } from "../types/index.js";
import type { LogQueryInput } from "../validators/activity.validator.js";
import type { Role } from "../../../types/index.js";

const generateId = () => crypto.randomUUID();

export const logRepository = {
  async create(data: LogInput) {
    const [row] = await db
      .insert(activityLog)
      .values({
        id: generateId(),
        userId: data.userId ?? null,
        action: data.action,
        module: data.module,
        entityType: data.entityType ?? null,
        entityId: data.entityId ?? null,
        description: data.description ?? null,
        metadata: data.metadata ?? null,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      })
      .returning();
    return row;
  },

  async findAll(filters: LogQueryInput, role: Role, requestingUserId: string) {
    const conds: SQL[] = [];

    // Role-based scoping
    if (role === "EMPLOYEE") {
      conds.push(eq(activityLog.userId, requestingUserId));
    } else if (role === "DEPARTMENT_HEAD" || role === "ASSET_MANAGER") {
      // These roles see org-wide logs but can filter by userId
      if (filters.userId) conds.push(eq(activityLog.userId, filters.userId));
    } else {
      // ADMIN — full access
      if (filters.userId) conds.push(eq(activityLog.userId, filters.userId));
    }

    if (filters.module) conds.push(eq(activityLog.module, filters.module as ActivityModule));
    if (filters.entityType) conds.push(eq(activityLog.entityType, filters.entityType));
    if (filters.entityId) conds.push(eq(activityLog.entityId, filters.entityId));
    if (filters.action) conds.push(ilike(activityLog.action, `%${filters.action}%`));
    if (filters.search) {
      conds.push(
        or(
          ilike(activityLog.description, `%${filters.search}%`),
          ilike(activityLog.action, `%${filters.search}%`),
          ilike(activityLog.entityType, `%${filters.search}%`)
        )!
      );
    }
    if (filters.dateFrom) conds.push(gte(activityLog.createdAt, new Date(filters.dateFrom)));
    if (filters.dateTo) conds.push(lte(activityLog.createdAt, new Date(filters.dateTo)));

    const where = conds.length ? and(...conds) : undefined;
    const offset = (filters.page - 1) * filters.limit;

    const rows = await db
      .select({
        id: activityLog.id,
        userId: activityLog.userId,
        userName: user.name,
        userEmail: user.email,
        action: activityLog.action,
        module: activityLog.module,
        entityType: activityLog.entityType,
        entityId: activityLog.entityId,
        description: activityLog.description,
        metadata: activityLog.metadata,
        ipAddress: activityLog.ipAddress,
        userAgent: activityLog.userAgent,
        createdAt: activityLog.createdAt,
      })
      .from(activityLog)
      .leftJoin(user, eq(activityLog.userId, user.id))
      .where(where)
      .orderBy(desc(activityLog.createdAt))
      .limit(filters.limit)
      .offset(offset);

    return rows;
  },

  async findById(id: string) {
    const rows = await db
      .select({
        id: activityLog.id,
        userId: activityLog.userId,
        userName: user.name,
        userEmail: user.email,
        action: activityLog.action,
        module: activityLog.module,
        entityType: activityLog.entityType,
        entityId: activityLog.entityId,
        description: activityLog.description,
        metadata: activityLog.metadata,
        ipAddress: activityLog.ipAddress,
        userAgent: activityLog.userAgent,
        createdAt: activityLog.createdAt,
      })
      .from(activityLog)
      .leftJoin(user, eq(activityLog.userId, user.id))
      .where(eq(activityLog.id, id))
      .limit(1);
    return rows[0] ?? null;
  },
};
