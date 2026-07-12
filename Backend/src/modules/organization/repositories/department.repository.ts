import { eq, and, ilike, ne } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { department } from "../../../db/schema/index.js";
import type { CreateDepartmentInput, UpdateDepartmentInput } from "../validators/department.validator.js";

const generateId = () => crypto.randomUUID();

export const departmentRepository = {
  async findById(id: string) {
    return db.query.department.findFirst({
      where: eq(department.id, id),
    });
  },

  async findByName(name: string, excludeId?: string) {
    const conditions = [ilike(department.name, name)];
    if (excludeId) conditions.push(ne(department.id, excludeId));
    return db.query.department.findFirst({ where: and(...conditions) });
  },

  async findAll() {
    return db.select().from(department).orderBy(department.name);
  },

  async findActive() {
    return db
      .select()
      .from(department)
      .where(eq(department.status, "ACTIVE"))
      .orderBy(department.name);
  },

  async findByHeadId(userId: string, excludeDeptId?: string) {
    const conditions = [eq(department.departmentHeadId, userId)];
    if (excludeDeptId) conditions.push(ne(department.id, excludeDeptId));
    return db.query.department.findFirst({ where: and(...conditions) });
  },

  async create(data: CreateDepartmentInput) {
    const now = new Date();
    const [created] = await db
      .insert(department)
      .values({
        id: generateId(),
        name: data.name,
        description: data.description ?? null,
        parentDepartmentId: data.parentDepartmentId ?? null,
        departmentHeadId: data.departmentHeadId ?? null,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  },

  async update(id: string, data: UpdateDepartmentInput) {
    const [updated] = await db
      .update(department)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(department.id, id))
      .returning();
    return updated;
  },

  async deactivate(id: string) {
    const [updated] = await db
      .update(department)
      .set({ status: "INACTIVE", updatedAt: new Date() })
      .where(eq(department.id, id))
      .returning();
    return updated;
  },

  // Walk up the parent chain to detect a cycle: would setting newParentId on deptId create one?
  async wouldCreateCycle(deptId: string, newParentId: string): Promise<boolean> {
    let currentId: string | null = newParentId;
    const visited = new Set<string>();

    while (currentId !== null) {
      if (currentId === deptId) return true;
      if (visited.has(currentId)) return true;
      visited.add(currentId);

      const rows = await db
        .select({ parentDepartmentId: department.parentDepartmentId })
        .from(department)
        .where(eq(department.id, currentId))
        .limit(1);
      currentId = rows[0]?.parentDepartmentId ?? null;
    }
    return false;
  },
};
