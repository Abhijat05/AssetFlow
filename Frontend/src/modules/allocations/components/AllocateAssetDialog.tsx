import React, { useEffect, useMemo } from "react";
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
import { useAllocateAsset } from "../hooks/useAllocations";
import { useAssets } from "../../assets/hooks/useAssets";
import { useDepartments, useEmployees } from "../../organization/hooks/useOrganization";
import { UserCheck, Loader2 } from "lucide-react";

const schema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  employeeId: z.string().min(1, "Employee is required"),
  departmentId: z.string().min(1, "Department is required"),
  expectedReturnDate: z.string().nullish(),
  notes: z.string().nullish(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AllocateAssetDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  // Load available assets
  const { data: assetsData } = useAssets({ limit: 100 });
  const assets = assetsData?.data ?? [];
  const availableAssets = assets.filter((a) => a.status === "AVAILABLE");

  // Load employees & departments
  const { data: employeesData } = useEmployees({ limit: 100 });
  const employees = useMemo(() => employeesData?.data ?? [], [employeesData?.data]);
  const { data: departments = [] } = useDepartments();

  const allocateAsset = useAllocateAsset();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      assetId: "",
      employeeId: "",
      departmentId: "",
      expectedReturnDate: "",
      notes: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedEmployeeId = watch("employeeId");

  // Auto-fill department when employee is selected
  useEffect(() => {
    if (selectedEmployeeId) {
      const emp = employees.find((e) => e.id === selectedEmployeeId);
      if (emp && emp.departmentId) {
        setValue("departmentId", emp.departmentId);
      }
    }
  }, [selectedEmployeeId, employees, setValue]);

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      // Backend expects expectedReturnDate to be ISO datetime string with offset
      const isoReturnDate = values.expectedReturnDate
        ? new Date(values.expectedReturnDate).toISOString()
        : null;

      await allocateAsset.mutateAsync({
        assetId: values.assetId,
        employeeId: values.employeeId,
        departmentId: values.departmentId,
        expectedReturnDate: isoReturnDate,
        notes: values.notes || null,
      });
      handleClose();
    } catch {
      // Handled by mutate onError hook
    }
  };

  const isBusy = isSubmitting || allocateAsset.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-canvas">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#4262ff]/10 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-[#4262ff]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-ink">Allocate Asset</DialogTitle>
              <DialogDescription className="text-sm text-ink-subtle">
                Assign an available physical resource to a holder.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Asset Selection */}
          <div className="space-y-1.5">
            <Label>Asset <span className="text-red-500">*</span></Label>
            <Controller
              control={control}
              name="assetId"
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className={errors.assetId ? "border-red-400" : ""}>
                    <SelectValue placeholder={availableAssets.length > 0 ? "Select asset" : "No available assets"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAssets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} ({asset.assetTag})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assetId && <p className="text-xs text-red-500">{errors.assetId.message}</p>}
          </div>

          {/* Employee Selection */}
          <div className="space-y-1.5">
            <Label>Employee <span className="text-red-500">*</span></Label>
            <Controller
              control={control}
              name="employeeId"
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className={errors.employeeId ? "border-red-400" : ""}>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.employeeId && <p className="text-xs text-red-500">{errors.employeeId.message}</p>}
          </div>

          {/* Department Selection */}
          <div className="space-y-1.5">
            <Label>Department <span className="text-red-500">*</span></Label>
            <Controller
              control={control}
              name="departmentId"
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className={errors.departmentId ? "border-red-400" : ""}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.departmentId && <p className="text-xs text-red-500">{errors.departmentId.message}</p>}
          </div>

          {/* Expected Return Date */}
          <div className="space-y-1.5">
            <Label htmlFor="expected-return">Expected Return Date</Label>
            <Controller
              control={control}
              name="expectedReturnDate"
              render={({ field }) => (
                <Input
                  id="expected-return"
                  type="date"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Allocation Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional comments or assignment instructions..."
              rows={3}
              {...register("notes")}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy} className="rounded-full bg-[#4262ff] hover:bg-[#3451e0] text-white">
              {isBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
