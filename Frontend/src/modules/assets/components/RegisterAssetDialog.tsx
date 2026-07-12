import React, { useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Textarea } from "../../../components/ui/textarea";
import { Separator } from "../../../components/ui/separator";
import { useRegisterAsset } from "../hooks/useAssets";
import { useDepartments, useCategories } from "../../organization/hooks/useOrganization";
import { ImageDropZone, DocumentDropZone } from "./FileDropZone";
import { assetApi } from "../services/api";
import { toast } from "sonner";
import { Package, Loader2 } from "lucide-react";

const CONDITIONS = [
  { value: "NEW", label: "New" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
  { value: "DAMAGED", label: "Damaged" },
] as const;

const schema = z.object({
  name: z.string().min(1, "Asset name is required").max(200),
  categoryId: z.string().min(1, "Category is required"),
  departmentId: z.string().nullish(),
  serialNumber: z.string().nullish(),
  description: z.string().nullish(),
  currentLocation: z.string().nullish(),
  acquisitionDate: z.string().nullish(),
  acquisitionCost: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().min(0).nullable()
  ),
  condition: z.enum(["NEW", "EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"]),
  isBookable: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegisterAssetDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { data: categories = [] } = useCategories();
  const { data: departments = [] } = useDepartments();
  const registerAsset = useRegisterAsset();

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: "",
      categoryId: "",
      departmentId: null,
      serialNumber: null,
      description: null,
      currentLocation: null,
      acquisitionDate: null,
      acquisitionCost: null,
      condition: "GOOD",
      isBookable: false,
    },
  });

  const handleClose = () => {
    reset();
    setPhotoFile(null);
    setDocFiles([]);
    onOpenChange(false);
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const created = await registerAsset.mutateAsync({
      name: values.name,
      categoryId: values.categoryId,
      condition: values.condition,
      isBookable: values.isBookable,
      departmentId: values.departmentId ?? null,
      serialNumber: values.serialNumber ?? null,
      description: values.description ?? null,
      currentLocation: values.currentLocation ?? null,
      acquisitionDate: values.acquisitionDate ?? null,
      acquisitionCost: values.acquisitionCost ?? null,
    });

    const assetId = created.data.id;
    setIsUploading(true);
    try {
      if (photoFile) await assetApi.uploadAssetPhoto(assetId, photoFile);
      if (docFiles.length > 0) await assetApi.uploadDocuments(assetId, docFiles);
    } catch (err: unknown) {
      toast.warning("Asset created but some uploads failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsUploading(false);
    }

    handleClose();
  };

  const isBusy = isSubmitting || isUploading || registerAsset.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-canvas">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#4262ff]/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-[#4262ff]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-ink">Register New Asset</DialogTitle>
              <DialogDescription className="text-sm text-ink-subtle">
                Add a new asset to the inventory registry.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          {/* Core Info */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-subtle">Core Information</p>

            <div className="space-y-1.5">
              <Label htmlFor="reg-name">Asset Name <span className="text-red-500">*</span></Label>
              <Input
                id="reg-name"
                placeholder="e.g., Dell Latitude 5520 Laptop"
                {...register("name")}
                className={errors.name ? "border-red-400" : ""}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category <span className="text-red-500">*</span></Label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.categoryId ? "border-red-400" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Department</Label>
                <Controller
                  control={control}
                  name="departmentId"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— None —</SelectItem>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-serial">Serial Number</Label>
                <Input id="reg-serial" placeholder="e.g., SN-2024-00123" {...register("serialNumber")} />
              </div>
              <div className="space-y-1.5">
                <Label>Condition <span className="text-red-500">*</span></Label>
                <Controller
                  control={control}
                  name="condition"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-desc">Description</Label>
              <Textarea
                id="reg-desc"
                placeholder="Brief description of the asset..."
                rows={3}
                {...register("description")}
              />
            </div>
          </div>

          <Separator />

          {/* Acquisition & Location */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-subtle">Acquisition & Location</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-location">Current Location</Label>
                <Input id="reg-location" placeholder="e.g., Building A, Floor 3" {...register("currentLocation")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-date">Acquisition Date</Label>
                <Input id="reg-date" type="date" {...register("acquisitionDate")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-cost">Acquisition Cost (₹)</Label>
                <Input
                  id="reg-cost"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  {...register("acquisitionCost")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bookable</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Controller
                    control={control}
                    name="isBookable"
                    render={({ field }) => (
                      <Switch
                        id="reg-bookable"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="reg-bookable" className="text-sm text-ink-subtle font-normal cursor-pointer">
                    Allow booking requests
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* File Uploads */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-subtle">Media & Documents</p>

            <div className="space-y-1.5">
              <Label>Asset Photo</Label>
              <ImageDropZone value={photoFile} onChange={setPhotoFile} />
            </div>

            <div className="space-y-1.5">
              <Label>Supporting Documents</Label>
              <DocumentDropZone files={docFiles} onChange={setDocFiles} uploading={isUploading} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy} className="rounded-full">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isBusy}
              className="rounded-full bg-[#4262ff] hover:bg-[#3451e0] text-white"
            >
              {isBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Register Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
