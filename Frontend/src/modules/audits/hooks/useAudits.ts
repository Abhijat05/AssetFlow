import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { auditApi } from "../services/api";
import type {
  AuditQuery,
  CreateAuditInput,
  UpdateAuditInput,
  VerifyAssetInput,
} from "../types";

export const AUDITS_LISTS_KEY = "audits";
export const AUDIT_DETAIL_KEY = (id: string) => ["audit", id];
export const DISCREPANCY_REPORT_KEY = (id: string) => ["discrepancy-report", id];

export function useAudits(query: AuditQuery) {
  return useQuery({
    queryKey: [AUDITS_LISTS_KEY, query],
    queryFn: () => auditApi.getAudits(query),
  });
}

export function useAudit(id: string) {
  return useQuery({
    queryKey: AUDIT_DETAIL_KEY(id),
    queryFn: () => auditApi.getAuditById(id),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useDiscrepancyReport(id: string, enabled = true) {
  return useQuery({
    queryKey: DISCREPANCY_REPORT_KEY(id),
    queryFn: () => auditApi.getDiscrepancyReport(id),
    enabled: !!id && enabled,
    select: (res) => res.data,
  });
}

export function useCreateAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAuditInput) => {
      const { auditorIds, ...cycleData } = data;
      // 1. Create audit cycle
      const res = await auditApi.createAuditCycle(cycleData);
      const cycleId = res.data.id;
      // 2. Assign auditors
      if (auditorIds && auditorIds.length > 0) {
        await auditApi.assignAuditors(cycleId, auditorIds);
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Audit cycle created and auditors assigned successfully!");
      qc.invalidateQueries({ queryKey: [AUDITS_LISTS_KEY] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create audit cycle");
    },
  });
}

export function useUpdateAudit(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAuditInput) => auditApi.updateAuditCycle(id, data),
    onSuccess: () => {
      toast.success("Audit cycle updated successfully!");
      qc.invalidateQueries({ queryKey: [AUDITS_LISTS_KEY] });
      qc.invalidateQueries({ queryKey: AUDIT_DETAIL_KEY(id) });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update audit cycle");
    },
  });
}

export function useVerifyAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      auditId,
      assetId,
      data,
    }: {
      auditId: string;
      assetId: string;
      data: VerifyAssetInput;
    }) => auditApi.verifyAsset(auditId, assetId, data),
    onSuccess: (_, variables) => {
      toast.success("Asset verification recorded!");
      qc.invalidateQueries({ queryKey: AUDIT_DETAIL_KEY(variables.auditId) });
      qc.invalidateQueries({ queryKey: DISCREPANCY_REPORT_KEY(variables.auditId) });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to record verification");
    },
  });
}

export function useCloseAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => auditApi.closeAudit(id),
    onSuccess: (_, id) => {
      toast.success("Audit cycle closed successfully!");
      qc.invalidateQueries({ queryKey: [AUDITS_LISTS_KEY] });
      qc.invalidateQueries({ queryKey: AUDIT_DETAIL_KEY(id) });
      qc.invalidateQueries({ queryKey: DISCREPANCY_REPORT_KEY(id) });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to close audit cycle");
    },
  });
}
