import { eq, ilike, and, asc, desc, count, SQL } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { user } from "../../../db/schema/index.js";
import type { EmployeeQueryInput } from "../validators/employee.validator.js";
import type { Role, UserStatus } from "../../../types/index.js";

export const employeeRepository = {
  async findById(id: string) {
    return db.query.user.findFirst({ where: eq(user.id, id) });
  },

  async findAll(query: EmployeeQueryInput) {
    const { name, email, departmentId, role, status, page, limit, sortBy, sortOrder } = query;

    const conditions: SQL[] = [];
    if (name) conditions.push(ilike(user.name, `%${name}%`));
    if (email) conditions.push(ilike(user.email, `%${email}%`));
    if (departmentId) conditions.push(eq(user.departmentId, departmentId));
    if (role) conditions.push(eq(user.role, role));
    if (status) conditions.push(eq(user.status, status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumn = {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    }[sortBy];

    const orderBy = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);
    const offset = (page - 1) * limit;

    const [rows, [{ value: total }]] = await Promise.all([
      db.select().from(user).where(where).orderBy(orderBy).limit(limit).offset(offset),
      db.select({ value: count() }).from(user).where(where),
    ]);

    return { rows, total: Number(total) };
  },

  async updateDepartment(id: string, departmentId: string | null) {
    const [updated] = await db
      .update(user)
      .set({ departmentId, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();
    return updated;
  },

  async updateRole(id: string, role: Role) {
    const [updated] = await db
      .update(user)
      .set({ role, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();
    return updated;
  },

  async updateStatus(id: string, status: UserStatus) {
    const [updated] = await db
      .update(user)
      .set({ status, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();
    return updated;
  },
};
