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
import { useRequestTransfer } from "../hooks/useAllocations";
import { useEmployees } from "../../organization/hooks/useOrganization";
import { ArrowRightLeft, Loader2 } from "lucide-react";

const schema = z.object({
  targetEmployeeId: z.string().min(1, "Recipient employee is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocationId: string;
  assetId: string;
  currentHolderName: string;
}

export const TransferRequestDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  allocationId,
  assetId,
  currentHolderName,
}) => {
  const { data: employeesData } = useEmployees({ limit: 100 });
  const employees = employeesData?.data ?? [];

  const requestTransfer = useRequestTransfer(allocationId);

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
      targetEmployeeId: "",
      reason: "",
    },
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      const targetEmp = employees.find((e) => e.id === values.targetEmployeeId);
      const requestedDeptId = targetEmp?.departmentId ?? null;

      await requestTransfer.mutateAsync({
        assetId,
        requestedEmployeeId: values.targetEmployeeId,
        requestedDepartmentId: requestedDeptId,
        reason: values.reason,
      });
      handleClose();
    } catch {
      // handled in hook
    }
  };

  const isBusy = isSubmitting || requestTransfer.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-canvas">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-blue/10 flex items-center justify-center">
              <ArrowRightLeft className="h-5 w-5 text-brand-blue" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-ink">Request Asset Transfer</DialogTitle>
              <DialogDescription className="text-sm text-ink-subtle">
                Request to transfer this asset from the current holder.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wide">Current Holder:</span>
          <span className="ml-1.5 font-bold text-ink">{currentHolderName}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Target Employee */}
          <div className="space-y-1.5">
            <Label>Recipient Employee <span className="text-red-500">*</span></Label>
            <Controller
              control={control}
              name="targetEmployeeId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={errors.targetEmployeeId ? "border-red-400" : ""}>
                    <SelectValue placeholder="Select new recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.targetEmployeeId && <p className="text-xs text-red-500">{errors.targetEmployeeId.message}</p>}
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="transfer-reason">Reason for Transfer <span className="text-red-500">*</span></Label>
            <Textarea
              id="transfer-reason"
              placeholder="Provide a detailed explanation for this transfer..."
              rows={3}
              {...register("reason")}
              className={errors.reason ? "border-red-400" : ""}
            />
            {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy} className="rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white">
              {isBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
