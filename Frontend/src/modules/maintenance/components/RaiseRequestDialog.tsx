import React, { useState, useMemo } from "react";
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
import { Textarea } from "../../../components/ui/textarea";
import { useCreateMaintenanceRequest, useUploadAttachment } from "../hooks/useMaintenance";
import { useAssets } from "../../assets/hooks/useAssets";
import { Loader2, AlertCircle, UploadCloud, File, X } from "lucide-react";

const schema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  issueTitle: z.string().min(1, "Issue title is required").max(200, "Title is too long"),
  issueDescription: z.string().min(1, "Issue description is required").max(2000, "Description is too long"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).default("MEDIUM"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RaiseRequestDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  // Load assets list
  const { data: assetsData } = useAssets({ limit: 100 });
  const assets = useMemo(() => assetsData?.data ?? [], [assetsData]);

  const createRequest = useCreateMaintenanceRequest();
  const uploadAttachment = useUploadAttachment();

  // Attachments state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      assetId: "",
      issueTitle: "",
      issueDescription: "",
      priority: "MEDIUM",
    },
  });

  const handleClose = () => {
    reset();
    setSelectedFiles([]);
    setUploadProgress("");
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      // 1. Create maintenance ticket
      const ticketRes = await createRequest.mutateAsync(values);
      const ticketId = ticketRes.data?.id;

      if (!ticketId) {
        throw new Error("Unable to retrieve created request ID");
      }

      // 2. Upload attachments sequentially if present
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          setUploadProgress(`Uploading attachment ${i + 1} of ${selectedFiles.length}...`);
          await uploadAttachment.mutateAsync({ id: ticketId, file });
        }
      }

      handleClose();
    } catch {
      // Catch error
    }
  };

  const isBusy = createRequest.isPending || uploadAttachment.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-canvas">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
              <UploadCloud className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-ink">Raise Maintenance Request</DialogTitle>
              <DialogDescription className="text-sm text-ink-subtle">
                Report issues or schedule servicing for active assets.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {createRequest.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2 text-red-800 text-xs">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Failed to raise request:</span> {createRequest.error.message}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Asset Selection */}
          <div className="space-y-1.5">
            <Label>Target Asset <span className="text-red-500">*</span></Label>
            <Controller
              control={control}
              name="assetId"
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className={errors.assetId ? "border-red-400" : ""}>
                    <SelectValue placeholder="Select asset with issue" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((ast) => (
                      <SelectItem key={ast.id} value={ast.id}>
                        {ast.name} ({ast.assetTag})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assetId && <p className="text-xs text-red-500">{errors.assetId.message}</p>}
          </div>

          {/* Issue Title */}
          <div className="space-y-1.5">
            <Label htmlFor="issue-title">Issue Title <span className="text-red-500">*</span></Label>
            <Input
              id="issue-title"
              placeholder="e.g. Screen flickering or Engine oil leakage"
              className={errors.issueTitle ? "border-red-400" : ""}
              {...register("issueTitle")}
            />
            {errors.issueTitle && <p className="text-xs text-red-500">{errors.issueTitle.message}</p>}
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label>Urgency / Priority</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low - Minor issue</SelectItem>
                    <SelectItem value="MEDIUM">Medium - Normal operational issue</SelectItem>
                    <SelectItem value="HIGH">High - Urgent disruption</SelectItem>
                    <SelectItem value="CRITICAL">Critical - Complete breakdown</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Issue Description */}
          <div className="space-y-1.5">
            <Label htmlFor="issue-desc">Issue Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="issue-desc"
              placeholder="Describe the symptoms, when it started, and steps to reproduce..."
              rows={3}
              className={errors.issueDescription ? "border-red-400" : ""}
              {...register("issueDescription")}
            />
            {errors.issueDescription && <p className="text-xs text-red-500">{errors.issueDescription.message}</p>}
          </div>

          {/* Attachments Area */}
          <div className="space-y-1.5">
            <Label>Attachments (Photos / Logs)</Label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title="Select attachments"
              />
              <UploadCloud className="h-7 w-7 text-slate-400 mb-1" />
              <p className="text-xs font-semibold text-slate-700">Click or drag files here to attach</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Images, PDFs, Word or Text files (Max 20MB)</p>
            </div>

            {/* List of files to upload */}
            {selectedFiles.length > 0 && (
              <div className="mt-2.5 space-y-1.5 max-h-36 overflow-y-auto">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <File className="h-3.5 w-3.5 text-[#4262ff] flex-shrink-0" />
                      <span className="truncate font-medium text-slate-700">{file.name}</span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Progress Loader */}
          {uploadProgress && (
            <div className="flex items-center gap-2 text-xs font-medium text-[#4262ff] bg-[#4262ff]/5 border border-[#4262ff]/10 rounded-xl p-2.5 animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {uploadProgress}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy} className="rounded-full bg-[#4262ff] hover:bg-[#3451e0] text-white">
              {isBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
