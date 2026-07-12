import { employeeRepository } from "../repositories/employee.repository.js";
import { departmentRepository } from "../repositories/department.repository.js";
import { activityLogService } from "./activityLog.service.js";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../../utils/errors.js";
import type {
  UpdateRoleInput,
  UpdateDepartmentInput,
  UpdateStatusInput,
  EmployeeQueryInput,
} from "../validators/employee.validator.js";
import type { Role } from "../../../types/index.js";

export const employeeService = {
  async getAll(query: EmployeeQueryInput) {
    const { rows, total } = await employeeRepository.findAll(query);
    return {
      data: rows,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async getById(id: string) {
    const employee = await employeeRepository.findById(id);
    if (!employee) throw new NotFoundError("User not found");
    return employee;
  },

  async updateDepartment(id: string, data: UpdateDepartmentInput) {
    const employee = await employeeRepository.findById(id);
    if (!employee) throw new NotFoundError("User not found");

    if (data.departmentId !== null) {
      const dept = await departmentRepository.findById(data.departmentId);
      if (!dept) throw new NotFoundError("Department not found");
      if (dept.status === "INACTIVE") throw new ValidationError("Department is inactive");
    }

    return employeeRepository.updateDepartment(id, data.departmentId);
  },

  async updateRole(id: string, data: UpdateRoleInput, performedById: string) {
    if (id === performedById)
      throw new ValidationError("You cannot change your own role");

    const employee = await employeeRepository.findById(id);
    if (!employee) throw new NotFoundError("User not found");

    if (data.role === "DEPARTMENT_HEAD") {
      if (!data.departmentId)
        throw new ValidationError("departmentId is required when assigning DEPARTMENT_HEAD role");

      const dept = await departmentRepository.findById(data.departmentId);
      if (!dept) throw new NotFoundError("Department not found");
      if (dept.status === "INACTIVE") throw new ValidationError("Department is inactive");

      // Prevent duplicate department head
      const existingHead = await departmentRepository.findByHeadId(id);
      const conflictInDept = await departmentRepository.findByHeadId(id, data.departmentId);
      if (dept.departmentHeadId && dept.departmentHeadId !== id)
        throw new ConflictError(`Department "${dept.name}" already has a head assigned`);

      // Associate user with department and update department head
      await employeeRepository.updateDepartment(id, data.departmentId);
      await departmentRepository.update(data.departmentId, { departmentHeadId: id });
    }

    const fromRole = employee.role as Role;
    const updated = await employeeRepository.updateRole(id, data.role);

    await activityLogService.logRoleChange({
      performedBy: performedById,
      targetUserId: id,
      fromRole,
      toRole: data.role,
    });

    return updated;
  },

  async updateStatus(id: string, data: UpdateStatusInput) {
    const employee = await employeeRepository.findById(id);
    if (!employee) throw new NotFoundError("User not found");
    if (employee.status === data.status)
      throw new ValidationError(`User is already ${data.status}`);
    return employeeRepository.updateStatus(id, data.status);
  },
};
