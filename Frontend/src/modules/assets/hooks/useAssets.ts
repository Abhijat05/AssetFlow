import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { assetApi } from "../services/api";
import type { AssetQuery, RegisterAssetInput } from "../types";

export const ASSETS_KEY = "assets";
export const ASSET_KEY = (id: string) => ["asset", id];

export function useAssets(query: AssetQuery) {
  return useQuery({
    queryKey: [ASSETS_KEY, query],
    queryFn: () => assetApi.getAssets(query),
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ASSET_KEY(id),
    queryFn: () => assetApi.getAssetById(id),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useAssetHistory(assetId: string) {
  return useQuery({
    queryKey: ["asset-history", assetId],
    queryFn: () => assetApi.getAssetHistory(assetId),
    enabled: !!assetId,
    select: (res) => res.data,
  });
}

export function useRegisterAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterAssetInput) => assetApi.registerAsset(data),
    onSuccess: () => {
      toast.success("Asset registered successfully!");
      qc.invalidateQueries({ queryKey: [ASSETS_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to register asset");
    },
  });
}

export function useUpdateAsset(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<RegisterAssetInput>) => assetApi.updateAsset(id, data),
    onSuccess: () => {
      toast.success("Asset updated successfully!");
      qc.invalidateQueries({ queryKey: [ASSETS_KEY] });
      qc.invalidateQueries({ queryKey: ASSET_KEY(id) });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update asset");
    },
  });
}

export function useUploadAssetPhoto(assetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => assetApi.uploadAssetPhoto(assetId, file),
    onSuccess: () => {
      toast.success("Photo uploaded successfully!");
      qc.invalidateQueries({ queryKey: ASSET_KEY(assetId) });
      qc.invalidateQueries({ queryKey: [ASSETS_KEY] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload photo");
    },
  });
}

export function useUploadDocuments(assetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => assetApi.uploadDocuments(assetId, files),
    onSuccess: () => {
      toast.success("Documents uploaded successfully!");
      qc.invalidateQueries({ queryKey: ASSET_KEY(assetId) });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload documents");
    },
  });
}
