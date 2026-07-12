import { departmentRepository } from "../repositories/department.repository.js";
import { employeeRepository } from "../repositories/employee.repository.js";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../../utils/errors.js";
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "../validators/department.validator.js";

export const departmentService = {
  async getAll() {
    return departmentRepository.findAll();
  },

  async getById(id: string) {
    const dept = await departmentRepository.findById(id);
    if (!dept) throw new NotFoundError("Department not found");
    return dept;
  },

  async create(data: CreateDepartmentInput) {
    const existing = await departmentRepository.findByName(data.name);
    if (existing) throw new ConflictError("A department with this name already exists");

    if (data.parentDepartmentId) {
      const parent = await departmentRepository.findById(data.parentDepartmentId);
      if (!parent) throw new NotFoundError("Parent department not found");
      if (parent.status === "INACTIVE")
        throw new ValidationError("Parent department is inactive");
    }

    if (data.departmentHeadId) {
      const head = await employeeRepository.findById(data.departmentHeadId);
      if (!head) throw new NotFoundError("Department head user not found");

      const alreadyHead = await departmentRepository.findByHeadId(data.departmentHeadId);
      if (alreadyHead)
        throw new ConflictError(
          `User is already the head of department "${alreadyHead.name}"`
        );
    }

    return departmentRepository.create(data);
  },

  async update(id: string, data: UpdateDepartmentInput) {
    const dept = await departmentRepository.findById(id);
    if (!dept) throw new NotFoundError("Department not found");

    if (data.name) {
      const existing = await departmentRepository.findByName(data.name, id);
      if (existing) throw new ConflictError("A department with this name already exists");
    }

    if (data.parentDepartmentId) {
      if (data.parentDepartmentId === id)
        throw new ValidationError("A department cannot be its own parent");

      const parent = await departmentRepository.findById(data.parentDepartmentId);
      if (!parent) throw new NotFoundError("Parent department not found");
      if (parent.status === "INACTIVE")
        throw new ValidationError("Parent department is inactive");

      const cycle = await departmentRepository.wouldCreateCycle(id, data.parentDepartmentId);
      if (cycle) throw new ValidationError("This parent assignment would create a circular hierarchy");
    }

    if (data.departmentHeadId) {
      const head = await employeeRepository.findById(data.departmentHeadId);
      if (!head) throw new NotFoundError("Department head user not found");

      const alreadyHead = await departmentRepository.findByHeadId(data.departmentHeadId, id);
      if (alreadyHead)
        throw new ConflictError(
          `User is already the head of department "${alreadyHead.name}"`
        );
    }

    return departmentRepository.update(id, data);
  },

  async deactivate(id: string) {
    const dept = await departmentRepository.findById(id);
    if (!dept) throw new NotFoundError("Department not found");
    if (dept.status === "INACTIVE") throw new ValidationError("Department is already inactive");
    return departmentRepository.deactivate(id);
  },
};
