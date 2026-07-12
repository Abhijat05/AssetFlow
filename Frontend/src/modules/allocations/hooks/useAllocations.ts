import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { allocationApi } from "../services/api";
import type { AllocationQuery, AllocateAssetInput } from "../types";

export const ALLOCATIONS_KEY = "allocations";
export const ALLOCATION_KEY = (id: string) => ["allocation", id];

export function useAllocations(query: AllocationQuery, isMy: boolean = false) {
  return useQuery({
    queryKey: [ALLOCATIONS_KEY, query, isMy],
    queryFn: () => allocationApi.getAllocations(query, isMy),
  });
}

export function useAllocation(id: string) {
  return useQuery({
    queryKey: ALLOCATION_KEY(id),
    queryFn: () => allocationApi.getAllocationById(id),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useAllocationHistory(allocationId: string) {
  return useQuery({
    queryKey: ["allocation-history", allocationId],
    queryFn: () => allocationApi.getHistory(allocationId),
    enabled: !!allocationId,
    select: (res) => res.data,
  });
}

export function useTransferRequests(allocationId: string) {
  return useQuery({
    queryKey: ["allocation-transfers", allocationId],
    queryFn: () => allocationApi.getTransferRequests(allocationId),
    enabled: !!allocationId,
    select: (res) => res.data,
  });
}

export function useAllocateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AllocateAssetInput) => allocationApi.allocateAsset(data),
    onSuccess: () => {
      toast.success("Asset allocated successfully!");
      qc.invalidateQueries({ queryKey: [ALLOCATIONS_KEY] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to allocate asset");
    },
  });
}

export function useRequestTransfer(allocationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { assetId: string; requestedEmployeeId: string; requestedDepartmentId?: string | null; reason: string }) =>
      allocationApi.requestTransfer(data),
    onSuccess: () => {
      toast.success("Transfer request submitted!");
      qc.invalidateQueries({ queryKey: [ALLOCATIONS_KEY] });
      qc.invalidateQueries({ queryKey: ALLOCATION_KEY(allocationId) });
      qc.invalidateQueries({ queryKey: ["allocation-transfers", allocationId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to request transfer");
    },
  });
}

export function useApproveTransfer(allocationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (transferRequestId: string) => allocationApi.approveTransfer(transferRequestId),
    onSuccess: () => {
      toast.success("Transfer request approved!");
      qc.invalidateQueries({ queryKey: [ALLOCATIONS_KEY] });
      qc.invalidateQueries({ queryKey: ALLOCATION_KEY(allocationId) });
      qc.invalidateQueries({ queryKey: ["allocation-transfers", allocationId] });
      qc.invalidateQueries({ queryKey: ["allocation-history", allocationId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to approve transfer");
    },
  });
}

export function useRejectTransfer(allocationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ transferRequestId, reason }: { transferRequestId: string; reason?: string | null }) =>
      allocationApi.rejectTransfer(transferRequestId, reason),
    onSuccess: () => {
      toast.success("Transfer request rejected!");
      qc.invalidateQueries({ queryKey: [ALLOCATIONS_KEY] });
      qc.invalidateQueries({ queryKey: ALLOCATION_KEY(allocationId) });
      qc.invalidateQueries({ queryKey: ["allocation-transfers", allocationId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reject transfer");
    },
  });
}

export function useRequestReturn(allocationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => allocationApi.requestReturn(allocationId),
    onSuccess: () => {
      toast.success("Return request submitted!");
      qc.invalidateQueries({ queryKey: [ALLOCATIONS_KEY] });
      qc.invalidateQueries({ queryKey: ALLOCATION_KEY(allocationId) });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to request return");
    },
  });
}

export function useApproveReturn(allocationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { returnCondition: string; returnNotes?: string | null }) =>
      allocationApi.approveReturn(allocationId, data),
    onSuccess: () => {
      toast.success("Return request approved and finalized!");
      qc.invalidateQueries({ queryKey: [ALLOCATIONS_KEY] });
      qc.invalidateQueries({ queryKey: ALLOCATION_KEY(allocationId) });
      qc.invalidateQueries({ queryKey: ["allocation-history", allocationId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to approve return");
    },
  });
}
