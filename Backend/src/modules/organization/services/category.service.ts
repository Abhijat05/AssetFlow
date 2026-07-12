import { categoryRepository } from "../repositories/category.repository.js";
import { ConflictError, NotFoundError, ValidationError } from "../../../utils/errors.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../validators/category.validator.js";

export const categoryService = {
  async getAll() {
    return categoryRepository.findAll();
  },

  async getById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError("Asset category not found");
    return category;
  },

  async create(data: CreateCategoryInput) {
    const existing = await categoryRepository.findByName(data.name);
    if (existing) throw new ConflictError("An asset category with this name already exists");
    return categoryRepository.create(data);
  },

  async update(id: string, data: UpdateCategoryInput) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError("Asset category not found");

    if (data.name) {
      const existing = await categoryRepository.findByName(data.name, id);
      if (existing) throw new ConflictError("An asset category with this name already exists");
    }

    return categoryRepository.update(id, data);
  },

  async deactivate(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError("Asset category not found");
    if (category.status === "INACTIVE") throw new ValidationError("Category is already inactive");
    return categoryRepository.deactivate(id);
  },
};
