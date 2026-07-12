import React from "react";
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
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { useRequestReturn, useApproveReturn } from "../hooks/useAllocations";
import { Reply, Loader2 } from "lucide-react";

const schema = z.object({
  returnCondition: z.enum(["NEW", "EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"]),
  returnNotes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocationId: string;
  isApproving: boolean; // True if manager is completing/approving. False if employee is initiating.
}

const CONDITIONS = [
  { value: "NEW", label: "New" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
  { value: "DAMAGED", label: "Damaged" },
];

export const ReturnRequestDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  allocationId,
  isApproving,
}) => {
  const requestReturn = useRequestReturn(allocationId);
  const approveReturn = useApproveReturn(allocationId);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      returnCondition: "GOOD",
      returnNotes: "",
    },
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      const payload = {
        returnCondition: values.returnCondition,
        returnNotes: values.returnNotes || null,
      };

      if (isApproving) {
        await approveReturn.mutateAsync(payload);
      } else {
        await requestReturn.mutateAsync();
      }
      handleClose();
    } catch {
      // handled in mutations
    }
  };

  const isBusy = isSubmitting || requestReturn.isPending || approveReturn.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-canvas">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#4262ff]/10 flex items-center justify-center">
              <Reply className="h-5 w-5 text-[#4262ff]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-ink">
                {isApproving ? "Complete Asset Return" : "Request Return"}
              </DialogTitle>
              <DialogDescription className="text-sm text-ink-subtle">
                {isApproving
                  ? "Approve the return and record the current condition of the asset."
                  : "Submit a request to return the allocated asset to inventory."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Return Condition */}
          <div className="space-y-1.5">
            <Label>Return Condition <span className="text-red-500">*</span></Label>
            <Controller
              control={control}
              name="returnCondition"
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

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="return-notes">Return Notes</Label>
            <Controller
              control={control}
              name="returnNotes"
              render={({ field }) => (
                <Textarea
                  id="return-notes"
                  placeholder="Describe details about physical wear, missing components, or return details..."
                  rows={3}
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy} className="rounded-full bg-[#4262ff] hover:bg-[#3451e0] text-white">
              {isBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isApproving ? "Finalize Return" : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
