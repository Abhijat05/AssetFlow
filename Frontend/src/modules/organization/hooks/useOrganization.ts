import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orgApi } from "../services/api";
import type { EmployeeQuery } from "../types";
import { toast } from "sonner";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await orgApi.getDepartments();
      return response.data;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await orgApi.getCategories();
      return response.data;
    },
  });
}

export function useEmployees(query: EmployeeQuery) {
  return useQuery({
    queryKey: ["employees", query],
    queryFn: async () => {
      return orgApi.getEmployees(query);
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orgApi.createDepartment,
    onSuccess: () => {
      toast.success("Department created successfully!");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create department");
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string | null; parentDepartmentId?: string | null; departmentHeadId?: string | null; status?: "ACTIVE" | "INACTIVE" }) =>
      orgApi.updateDepartment(id, data),
    onSuccess: () => {
      toast.success("Department updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update department");
    },
  });
}

export function useDeactivateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orgApi.deactivateDepartment,
    onSuccess: () => {
      toast.success("Department deactivated successfully!");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to deactivate department");
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orgApi.createCategory,
    onSuccess: () => {
      toast.success("Asset category created successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create asset category");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string | null; customFields?: Record<string, unknown> | null; status?: "ACTIVE" | "INACTIVE" }) =>
      orgApi.updateCategory(id, data),
    onSuccess: () => {
      toast.success("Asset category updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update asset category");
    },
  });
}

export function useDeactivateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orgApi.deactivateCategory,
    onSuccess: () => {
      toast.success("Asset category deactivated successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to deactivate category");
    },
  });
}

export function useUpdateEmployeeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role, departmentId }: { id: string; role: string; departmentId?: string | null }) =>
      orgApi.updateEmployeeRole(id, role, departmentId),
    onSuccess: () => {
      toast.success("Employee role updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update employee role");
    },
  });
}

export function useUpdateEmployeeDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, departmentId }: { id: string; departmentId: string | null }) =>
      orgApi.updateEmployeeDepartment(id, departmentId),
    onSuccess: () => {
      toast.success("Employee department updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update employee department");
    },
  });
}

export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "INACTIVE" }) =>
      orgApi.updateEmployeeStatus(id, status),
    onSuccess: () => {
      toast.success("Employee status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update employee status");
    },
  });
}
