import { eq, and, ilike, ne } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { assetCategory } from "../../../db/schema/index.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validator.js";

const generateId = () => crypto.randomUUID();

export const categoryRepository = {
  async findById(id: string) {
    return db.query.assetCategory.findFirst({
      where: eq(assetCategory.id, id),
    });
  },

  async findByName(name: string, excludeId?: string) {
    const conditions = [ilike(assetCategory.name, name)];
    if (excludeId) conditions.push(ne(assetCategory.id, excludeId));
    return db.query.assetCategory.findFirst({ where: and(...conditions) });
  },

  async findAll() {
    return db.select().from(assetCategory).orderBy(assetCategory.name);
  },

  async create(data: CreateCategoryInput) {
    const now = new Date();
    const [created] = await db
      .insert(assetCategory)
      .values({
        id: generateId(),
        name: data.name,
        description: data.description ?? null,
        customFields: data.customFields ?? null,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  },

  async update(id: string, data: UpdateCategoryInput) {
    const [updated] = await db
      .update(assetCategory)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assetCategory.id, id))
      .returning();
    return updated;
  },

  async deactivate(id: string) {
    const [updated] = await db
      .update(assetCategory)
      .set({ status: "INACTIVE", updatedAt: new Date() })
      .where(eq(assetCategory.id, id))
      .returning();
    return updated;
  },
};
