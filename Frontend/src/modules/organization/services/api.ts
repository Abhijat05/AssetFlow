import type { Department, AssetCategory, Employee, EmployeeQuery, PaginatedResponse } from "../types";

async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json = {} as T & { error?: string; message?: string };
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // Ignore JSON parsing errors for empty text or non-json responses
  }

  if (!response.ok) {
    throw new Error(json.error || json.message || `Request failed with status ${response.status}`);
  }

  return json;
}

export const orgApi = {
  // Departments
  async getDepartments(): Promise<{ success: boolean; data: Department[] }> {
    return apiRequest<{ success: boolean; data: Department[] }>("/api/v1/organization/departments");
  },

  async getDepartmentById(id: string): Promise<{ success: boolean; data: Department }> {
    return apiRequest<{ success: boolean; data: Department }>(`/api/v1/organization/departments/${id}`);
  },

  async createDepartment(data: {
    name: string;
    description?: string | null;
    parentDepartmentId?: string | null;
    departmentHeadId?: string | null;
  }): Promise<{ success: boolean; data: Department }> {
    return apiRequest<{ success: boolean; data: Department }>("/api/v1/organization/departments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateDepartment(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      parentDepartmentId?: string | null;
      departmentHeadId?: string | null;
      status?: "ACTIVE" | "INACTIVE";
    }
  ): Promise<{ success: boolean; data: Department }> {
    return apiRequest<{ success: boolean; data: Department }>(`/api/v1/organization/departments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deactivateDepartment(id: string): Promise<{ success: boolean; data: Department }> {
    return apiRequest<{ success: boolean; data: Department }>(`/api/v1/organization/departments/${id}/deactivate`, {
      method: "PATCH",
    });
  },

  // Asset Categories
  async getCategories(): Promise<{ success: boolean; data: AssetCategory[] }> {
    return apiRequest<{ success: boolean; data: AssetCategory[] }>("/api/v1/organization/categories");
  },

  async getCategoryById(id: string): Promise<{ success: boolean; data: AssetCategory }> {
    return apiRequest<{ success: boolean; data: AssetCategory }>(`/api/v1/organization/categories/${id}`);
  },

  async createCategory(data: {
    name: string;
    description?: string | null;
    customFields?: Record<string, unknown> | null;
  }): Promise<{ success: boolean; data: AssetCategory }> {
    return apiRequest<{ success: boolean; data: AssetCategory }>("/api/v1/organization/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCategory(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      customFields?: Record<string, unknown> | null;
      status?: "ACTIVE" | "INACTIVE";
    }
  ): Promise<{ success: boolean; data: AssetCategory }> {
    return apiRequest<{ success: boolean; data: AssetCategory }>(`/api/v1/organization/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async deactivateCategory(id: string): Promise<{ success: boolean; data: AssetCategory }> {
    return apiRequest<{ success: boolean; data: AssetCategory }>(`/api/v1/organization/categories/${id}/deactivate`, {
      method: "PATCH",
    });
  },

  // Employees
  async getEmployees(query: EmployeeQuery): Promise<PaginatedResponse<Employee>> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = `/api/v1/organization/employees${queryString ? `?${queryString}` : ""}`;
    return apiRequest<PaginatedResponse<Employee>>(url);
  },

  async updateEmployeeDepartment(
    id: string,
    departmentId: string | null
  ): Promise<{ success: boolean; data: Employee }> {
    return apiRequest<{ success: boolean; data: Employee }>(`/api/v1/organization/employees/${id}/department`, {
      method: "PATCH",
      body: JSON.stringify({ departmentId }),
    });
  },

  async updateEmployeeRole(
    id: string,
    role: string,
    departmentId?: string | null
  ): Promise<{ success: boolean; data: Employee }> {
    return apiRequest<{ success: boolean; data: Employee }>(`/api/v1/organization/employees/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role, departmentId }),
    });
  },

  async updateEmployeeStatus(
    id: string,
    status: "ACTIVE" | "INACTIVE"
  ): Promise<{ success: boolean; data: Employee }> {
    return apiRequest<{ success: boolean; data: Employee }>(`/api/v1/organization/employees/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
