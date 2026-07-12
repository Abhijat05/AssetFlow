import { assetRepository } from "../repositories/asset.repository.js";
import { ConflictError, NotFoundError, ValidationError } from "../../../utils/errors.js";
import { storageService } from "./storage.service.js";
import { qrcodeService } from "./qrcode.service.js";
import { db } from "../../../db/index.js";
import { department, assetCategory } from "../../../db/schema/index.js";
import { eq } from "drizzle-orm";
import type { CreateAssetInput, UpdateAssetInput, AssetQueryInput } from "../validators/asset.validator.js";
import type { AttachmentType } from "../types/index.js";

const NON_BOOKABLE_STATUSES = new Set([
  "ALLOCATED",
  "UNDER_MAINTENANCE",
  "LOST",
  "RETIRED",
  "DISPOSED",
]);

function resolveIsBookable<T extends { isBookable: boolean; status: string }>(row: T): T {
  return { ...row, isBookable: row.isBookable && !NON_BOOKABLE_STATUSES.has(row.status) };
}

export const assetService = {
  async getAll(query: AssetQueryInput) {
    const { rows, total } = await assetRepository.findAll(query);
    const totalPages = Math.ceil(total / query.limit);
    return {
      data: rows.map(resolveIsBookable),
      meta: { total, page: query.page, limit: query.limit, totalPages },
    };
  },

  async getById(id: string) {
    const found = await assetRepository.findById(id);
    if (!found) throw new NotFoundError("Asset not found");

    const [attachments, history] = await Promise.all([
      assetRepository.findAttachmentsByAsset(id),
      assetRepository.findHistoryByAsset(id),
    ]);

    return { ...resolveIsBookable(found), attachments, history };
  },

  async create(data: CreateAssetInput, createdBy: string) {
    // Validate category exists and is active
    const category = await db
      .select({ id: assetCategory.id, status: assetCategory.status })
      .from(assetCategory)
      .where(eq(assetCategory.id, data.categoryId))
      .limit(1);
    if (!category[0]) throw new NotFoundError("Asset category not found");
    if (category[0].status === "INACTIVE")
      throw new ValidationError("Asset category is inactive");

    // Validate department exists and is active
    const dept = await db
      .select({ id: department.id, status: department.status })
      .from(department)
      .where(eq(department.id, data.departmentId))
      .limit(1);
    if (!dept[0]) throw new NotFoundError("Department not found");
    if (dept[0].status === "INACTIVE")
      throw new ValidationError("Department is inactive");

    // Validate unique serial number
    if (data.serialNumber) {
      const duplicate = await assetRepository.findBySerialNumber(data.serialNumber);
      if (duplicate)
        throw new ConflictError(`Serial number "${data.serialNumber}" is already in use`);
    }

    // Generate asset tag atomically enough — unique constraint catches true races
    const nextNum = await assetRepository.getNextTagNumber();
    const assetTag = assetRepository.formatAssetTag(nextNum);

    const created = await assetRepository.create(data, assetTag, createdBy);

    // Generate QR code and attach URL (non-blocking failure is acceptable)
    try {
      const qrCodeUrl = await qrcodeService.generateAndUpload(created.id, assetTag);
      await assetRepository.setQrCodeUrl(created.id, qrCodeUrl);
      created.qrCodeUrl = qrCodeUrl;
    } catch {
      // QR failure doesn't abort asset creation
    }

    // Initial history entry
    await assetRepository.createHistory({
      assetId: created.id,
      action: "CREATED",
      performedBy: createdBy,
      metadata: { assetTag, name: created.name },
    });

    return created;
  },

  async update(id: string, data: UpdateAssetInput, performedBy: string) {
    const existing = await assetRepository.findById(id);
    if (!existing) throw new NotFoundError("Asset not found");

    if (existing.status === "RETIRED" || existing.status === "DISPOSED")
      throw new ValidationError("Cannot update an archived asset");

    if (data.categoryId) {
      const category = await db
        .select({ id: assetCategory.id, status: assetCategory.status })
        .from(assetCategory)
        .where(eq(assetCategory.id, data.categoryId))
        .limit(1);
      if (!category[0]) throw new NotFoundError("Asset category not found");
      if (category[0].status === "INACTIVE")
        throw new ValidationError("Asset category is inactive");
    }

    if (data.departmentId) {
      const dept = await db
        .select({ id: department.id, status: department.status })
        .from(department)
        .where(eq(department.id, data.departmentId))
        .limit(1);
      if (!dept[0]) throw new NotFoundError("Department not found");
      if (dept[0].status === "INACTIVE")
        throw new ValidationError("Department is inactive");
    }

    if (data.serialNumber) {
      const duplicate = await assetRepository.findBySerialNumber(data.serialNumber, id);
      if (duplicate)
        throw new ConflictError(`Serial number "${data.serialNumber}" is already in use`);
    }

    const updated = await assetRepository.update(id, data);

    await assetRepository.createHistory({
      assetId: id,
      action: "UPDATED",
      performedBy,
      metadata: { changes: data },
    });

    return updated;
  },

  async archive(id: string, performedBy: string) {
    const existing = await assetRepository.findById(id);
    if (!existing) throw new NotFoundError("Asset not found");
    if (existing.status === "RETIRED")
      throw new ValidationError("Asset is already archived");

    const archived = await assetRepository.archive(id);

    await assetRepository.createHistory({
      assetId: id,
      action: "ARCHIVED",
      performedBy,
      metadata: { previousStatus: existing.status },
    });

    return archived;
  },

  async uploadAttachment(
    assetId: string,
    type: AttachmentType,
    file: Express.Multer.File,
    uploadedBy: string
  ) {
    const existing = await assetRepository.findById(assetId);
    if (!existing) throw new NotFoundError("Asset not found");

    const ext = file.originalname.split(".").pop() ?? "bin";
    const path = `attachments/${assetId}/${crypto.randomUUID()}.${ext}`;

    const url = await storageService.uploadFile(path, file.buffer, file.mimetype);

    const attachment = await assetRepository.createAttachment({
      assetId,
      type,
      fileName: file.originalname,
      fileUrl: url,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy,
    });

    await assetRepository.createHistory({
      assetId,
      action: "ATTACHMENT_ADDED",
      performedBy: uploadedBy,
      metadata: { type, fileName: file.originalname },
    });

    return attachment;
  },

  async deleteAttachment(assetId: string, attachmentId: string, performedBy: string) {
    const existing = await assetRepository.findById(assetId);
    if (!existing) throw new NotFoundError("Asset not found");

    const attachment = await assetRepository.findAttachmentById(attachmentId);
    if (!attachment || attachment.assetId !== assetId)
      throw new NotFoundError("Attachment not found");

    const storagePath = storageService.extractPath(attachment.fileUrl);
    try {
      await storageService.deleteFile(storagePath);
    } catch {
      // File may already be gone; continue to clean up the DB record
    }

    await assetRepository.deleteAttachment(attachmentId);

    await assetRepository.createHistory({
      assetId,
      action: "ATTACHMENT_REMOVED",
      performedBy,
      metadata: { type: attachment.type, fileName: attachment.fileName },
    });
  },
};
