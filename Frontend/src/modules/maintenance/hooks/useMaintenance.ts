import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { maintenanceApi } from "../services/api";
import type {
  MaintenanceQuery,
  CreateMaintenanceInput,
  ApproveRequestInput,
  RejectRequestInput,
  AssignTechnicianInput,
  ResolveMaintenanceInput,
} from "../types";

export const MAINTENANCE_LISTS_KEY = "maintenance-requests";
export const MAINTENANCE_DETAIL_KEY = (id: string) => ["maintenance-request", id];
export const MAINTENANCE_HISTORY_KEY = (id: string) => ["maintenance-history", id];

export function useMaintenanceRequests(query: MaintenanceQuery) {
  return useQuery({
    queryKey: [MAINTENANCE_LISTS_KEY, query],
    queryFn: () => maintenanceApi.getMaintenanceRequests(query),
  });
}

export function useMaintenanceRequest(id: string) {
  return useQuery({
    queryKey: MAINTENANCE_DETAIL_KEY(id),
    queryFn: () => maintenanceApi.getMaintenanceRequestById(id),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useMaintenanceHistory(requestId: string) {
  return useQuery({
    queryKey: MAINTENANCE_HISTORY_KEY(requestId),
    queryFn: () => maintenanceApi.getHistory(requestId),
    enabled: !!requestId,
    select: (res) => res.data,
  });
}

export function useCreateMaintenanceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaintenanceInput) => maintenanceApi.createMaintenanceRequest(data),
    onSuccess: () => {
      toast.success("Maintenance request raised successfully!");
      qc.invalidateQueries({ queryKey: [MAINTENANCE_LISTS_KEY] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to raise maintenance request");
    },
  });
}

export function useApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveRequestInput }) =>
      maintenanceApi.approveRequest(id, data),
    onSuccess: (_, variables) => {
      toast.success("Maintenance request approved!");
      qc.invalidateQueries({ queryKey: [MAINTENANCE_LISTS_KEY] });
      qc.invalidateQueries({ queryKey: MAINTENANCE_DETAIL_KEY(variables.id) });
      qc.invalidateQueries({ queryKey: MAINTENANCE_HISTORY_KEY(variables.id) });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to approve request");
    },
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectRequestInput }) =>
      maintenanceApi.rejectRequest(id, data),
    onSuccess: (_, variables) => {
      toast.success("Maintenance request rejected!");
      qc.invalidateQueries({ queryKey: [MAINTENANCE_LISTS_KEY] });
      qc.invalidateQueries({ queryKey: MAINTENANCE_DETAIL_KEY(variables.id) });
      qc.invalidateQueries({ queryKey: MAINTENANCE_HISTORY_KEY(variables.id) });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reject request");
    },
  });
}

export function useAssignTechnician() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignTechnicianInput }) =>
      maintenanceApi.assignTechnician(id, data),
    onSuccess: (_, variables) => {
      toast.success("Technician assigned successfully!");
      qc.invalidateQueries({ queryKey: [MAINTENANCE_LISTS_KEY] });
      qc.invalidateQueries({ queryKey: MAINTENANCE_DETAIL_KEY(variables.id) });
      qc.invalidateQueries({ queryKey: MAINTENANCE_HISTORY_KEY(variables.id) });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to assign technician");
    },
  });
}

export function useStartMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => maintenanceApi.startMaintenance(id),
    onSuccess: (_, id) => {
      toast.success("Maintenance started!");
      qc.invalidateQueries({ queryKey: [MAINTENANCE_LISTS_KEY] });
      qc.invalidateQueries({ queryKey: MAINTENANCE_DETAIL_KEY(id) });
      qc.invalidateQueries({ queryKey: MAINTENANCE_HISTORY_KEY(id) });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to start maintenance");
    },
  });
}

export function useResolveMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolveMaintenanceInput }) =>
      maintenanceApi.resolveMaintenance(id, data),
    onSuccess: (_, variables) => {
      toast.success("Maintenance marked as resolved!");
      qc.invalidateQueries({ queryKey: [MAINTENANCE_LISTS_KEY] });
      qc.invalidateQueries({ queryKey: MAINTENANCE_DETAIL_KEY(variables.id) });
      qc.invalidateQueries({ queryKey: MAINTENANCE_HISTORY_KEY(variables.id) });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to resolve maintenance");
    },
  });
}

export function useUploadAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      maintenanceApi.uploadAttachment(id, file),
    onSuccess: (_, variables) => {
      toast.success("File attached successfully!");
      qc.invalidateQueries({ queryKey: MAINTENANCE_DETAIL_KEY(variables.id) });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upload attachment");
    },
  });
}

export function useDeleteAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, attachmentId }: { id: string; attachmentId: string }) =>
      maintenanceApi.deleteAttachment(id, attachmentId),
    onSuccess: (_, variables) => {
      toast.success("Attachment deleted successfully!");
      qc.invalidateQueries({ queryKey: MAINTENANCE_DETAIL_KEY(variables.id) });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete attachment");
    },
  });
}
