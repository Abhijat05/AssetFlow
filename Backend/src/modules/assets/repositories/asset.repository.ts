import { eq, ilike, and, asc, desc, count, SQL } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { asset, assetAttachment, assetHistory } from "../../../db/schema/index.js";
import type { CreateAssetInput, UpdateAssetInput, AssetQueryInput } from "../validators/asset.validator.js";
import type { AssetStatus } from "../types/index.js";

const generateId = () => crypto.randomUUID();

export const assetRepository = {
  async findById(id: string) {
    return db.query.asset.findFirst({ where: eq(asset.id, id) });
  },

  async findByTag(assetTag: string) {
    return db.query.asset.findFirst({ where: eq(asset.assetTag, assetTag) });
  },

  async findBySerialNumber(serialNumber: string, excludeId?: string) {
    const rows = await db
      .select()
      .from(asset)
      .where(eq(asset.serialNumber, serialNumber))
      .limit(1);
    if (!rows[0]) return null;
    if (excludeId && rows[0].id === excludeId) return null;
    return rows[0];
  },

  async getNextTagNumber(): Promise<number> {
    // Find the highest numeric suffix across all asset tags (AF-XXXXXX)
    const rows = await db
      .select({ assetTag: asset.assetTag })
      .from(asset)
      .orderBy(desc(asset.assetTag))
      .limit(1);

    if (!rows[0]) return 1;
    const match = rows[0].assetTag.match(/^AF-(\d+)$/);
    if (!match) return 1;
    return parseInt(match[1], 10) + 1;
  },

  formatAssetTag(n: number): string {
    return `AF-${String(n).padStart(6, "0")}`;
  },

  async findAll(query: AssetQueryInput) {
    const {
      assetTag,
      name,
      serialNumber,
      departmentId,
      categoryId,
      location,
      status,
      condition,
      isBookable,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    const conditions: SQL[] = [];
    if (assetTag) conditions.push(ilike(asset.assetTag, `%${assetTag}%`));
    if (name) conditions.push(ilike(asset.name, `%${name}%`));
    if (serialNumber) conditions.push(ilike(asset.serialNumber, `%${serialNumber}%`));
    if (departmentId) conditions.push(eq(asset.departmentId, departmentId));
    if (categoryId) conditions.push(eq(asset.categoryId, categoryId));
    if (location) conditions.push(ilike(asset.currentLocation, `%${location}%`));
    if (status) conditions.push(eq(asset.status, status));
    if (condition) conditions.push(eq(asset.condition, condition));
    if (isBookable !== undefined) conditions.push(eq(asset.isBookable, isBookable));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumn = {
      name: asset.name,
      assetTag: asset.assetTag,
      status: asset.status,
      condition: asset.condition,
      acquisitionDate: asset.acquisitionDate,
      createdAt: asset.createdAt,
    }[sortBy];

    const orderBy = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);
    const offset = (page - 1) * limit;

    const [rows, [{ value: total }]] = await Promise.all([
      db.select().from(asset).where(where).orderBy(orderBy).limit(limit).offset(offset),
      db.select({ value: count() }).from(asset).where(where),
    ]);

    return { rows, total: Number(total) };
  },

  async create(data: CreateAssetInput, assetTag: string, createdBy: string) {
    const now = new Date();
    const [created] = await db
      .insert(asset)
      .values({
        id: generateId(),
        assetTag,
        name: data.name,
        categoryId: data.categoryId,
        serialNumber: data.serialNumber ?? null,
        description: data.description ?? null,
        departmentId: data.departmentId,
        currentLocation: data.currentLocation ?? null,
        acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : null,
        acquisitionCost: data.acquisitionCost != null ? String(data.acquisitionCost) : null,
        condition: data.condition,
        status: "AVAILABLE",
        isBookable: data.isBookable,
        qrCodeUrl: null,
        createdBy,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  },

  async update(id: string, data: UpdateAssetInput) {
    const values: Partial<typeof asset.$inferInsert> = { updatedAt: new Date() };
    if (data.name !== undefined) values.name = data.name;
    if (data.categoryId !== undefined) values.categoryId = data.categoryId;
    if (data.serialNumber !== undefined) values.serialNumber = data.serialNumber ?? null;
    if (data.description !== undefined) values.description = data.description ?? null;
    if (data.departmentId !== undefined) values.departmentId = data.departmentId;
    if (data.currentLocation !== undefined) values.currentLocation = data.currentLocation ?? null;
    if (data.acquisitionDate !== undefined)
      values.acquisitionDate = data.acquisitionDate ? new Date(data.acquisitionDate) : null;
    if (data.acquisitionCost !== undefined)
      values.acquisitionCost = data.acquisitionCost != null ? String(data.acquisitionCost) : null;
    if (data.condition !== undefined) values.condition = data.condition;
    if (data.status !== undefined) values.status = data.status;
    if (data.isBookable !== undefined) values.isBookable = data.isBookable;

    const [updated] = await db.update(asset).set(values).where(eq(asset.id, id)).returning();
    return updated;
  },

  async setQrCodeUrl(id: string, qrCodeUrl: string) {
    const [updated] = await db
      .update(asset)
      .set({ qrCodeUrl, updatedAt: new Date() })
      .where(eq(asset.id, id))
      .returning();
    return updated;
  },

  async archive(id: string) {
    const [updated] = await db
      .update(asset)
      .set({ status: "RETIRED" as AssetStatus, updatedAt: new Date() })
      .where(eq(asset.id, id))
      .returning();
    return updated;
  },

  // Attachments
  async createAttachment(data: {
    assetId: string;
    type: string;
    fileName: string;
    fileUrl: string;
    fileSize: number | null;
    mimeType: string | null;
    uploadedBy: string;
  }) {
    const [created] = await db
      .insert(assetAttachment)
      .values({ id: generateId(), ...data, createdAt: new Date() })
      .returning();
    return created;
  },

  async findAttachmentById(id: string) {
    const rows = await db
      .select()
      .from(assetAttachment)
      .where(eq(assetAttachment.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async findAttachmentsByAsset(assetId: string) {
    return db
      .select()
      .from(assetAttachment)
      .where(eq(assetAttachment.assetId, assetId))
      .orderBy(desc(assetAttachment.createdAt));
  },

  async deleteAttachment(id: string) {
    await db.delete(assetAttachment).where(eq(assetAttachment.id, id));
  },

  // History
  async createHistory(data: {
    assetId: string;
    action: string;
    performedBy: string;
    metadata?: Record<string, unknown>;
  }) {
    const [created] = await db
      .insert(assetHistory)
      .values({
        id: generateId(),
        assetId: data.assetId,
        action: data.action,
        performedBy: data.performedBy,
        timestamp: new Date(),
        metadata: data.metadata ?? null,
      })
      .returning();
    return created;
  },

  async findHistoryByAsset(assetId: string) {
    return db
      .select()
      .from(assetHistory)
      .where(eq(assetHistory.assetId, assetId))
      .orderBy(desc(assetHistory.timestamp));
  },
};
