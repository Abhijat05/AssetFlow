import React, { useEffect, useMemo, useState } from "react";
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
import { Checkbox } from "../../../components/ui/checkbox";
import { useCreateAudit } from "../hooks/useAudits";
import { useDepartments, useEmployees } from "../../organization/hooks/useOrganization";
import { Loader2, AlertCircle, ShieldCheck, Search, Users } from "lucide-react";
import { format } from "date-fns";

const schema = z
  .object({
    name: z.string().min(1, "Audit name is required").max(200, "Name is too long"),
    description: z.string().max(2000, "Description is too long").optional().nullable(),
    scopeType: z.enum(["ORGANIZATION", "DEPARTMENT", "LOCATION"] as const),
    departmentId: z.string().optional().nullable(),
    location: z.string().max(500, "Location is too long").optional().nullable(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    auditorIds: z.array(z.string()).min(1, "At least one auditor must be assigned"),
  })
  .refine(
    (data) => {
      if (data.scopeType === "DEPARTMENT") return !!data.departmentId;
      return true;
    },
    {
      message: "Department is required for Department scope",
      path: ["departmentId"],
    }
  )
  .refine(
    (data) => {
      if (data.scopeType === "LOCATION") return !!data.location;
      return true;
    },
    {
      message: "Location is required for Location scope",
      path: ["location"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      message: "End date must be after the start date",
      path: ["endDate"],
    }
  );

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAuditDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const createAudit = useCreateAudit();

  // Load departments
  const { data: departments = [] } = useDepartments();

  // Load employees for assigning auditors
  const { data: employeesData } = useEmployees({ limit: 100 });
  const employees = useMemo(() => employeesData?.data ?? [], [employeesData]);

  // Auditor filter search term
  const [auditorSearch, setAuditorSearch] = useState("");

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
      name: "",
      description: "",
      scopeType: "ORGANIZATION",
      departmentId: "",
      location: "",
      startDate: "",
      endDate: "",
      auditorIds: [],
    },
  });

  const scopeType = watch("scopeType");
  const selectedAuditors = watch("auditorIds") || [];

  // Reset defaults on open
  useEffect(() => {
    if (open) {
      reset({
        name: "",
        description: "",
        scopeType: "ORGANIZATION",
        departmentId: "",
        location: "",
        startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"), // +7 days
        auditorIds: [],
      });
      setAuditorSearch("");
    }
  }, [open, reset]);

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      // Convert date strings to ISO timezone strings
      const payload = {
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      };
      await createAudit.mutateAsync(payload);
      handleClose();
    } catch {
      // Ignored
    }
  };

  // Filter auditors by search
  const filteredAuditors = useMemo(() => {
    return employees.filter((e) =>
      e.name.toLowerCase().includes(auditorSearch.toLowerCase()) ||
      e.email.toLowerCase().includes(auditorSearch.toLowerCase())
    );
  }, [employees, auditorSearch]);

  const handleToggleAuditor = (id: string, checked: boolean) => {
    if (checked) {
      setValue("auditorIds", [...selectedAuditors, id]);
    } else {
      setValue("auditorIds", selectedAuditors.filter((audId) => audId !== id));
    }
  };

  const isBusy = isSubmitting || createAudit.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-canvas max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#4262ff]/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-[#4262ff]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-ink">Create Audit Cycle</DialogTitle>
              <DialogDescription className="text-sm text-ink-subtle">
                Establish a planned physical reconciliation cycle for tracking assets.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {createAudit.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2 text-red-800 text-xs">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Failed to create cycle:</span> {createAudit.error.message}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Audit Cycle Name */}
          <div className="space-y-1.5">
            <Label htmlFor="audit-name">Audit Name <span className="text-red-500">*</span></Label>
            <Input
              id="audit-name"
              placeholder="e.g. Q3 Physical Reconciliation 2026"
              className={errors.name ? "border-red-400" : ""}
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Scope Type */}
          <div className="space-y-1.5">
            <Label>Audit Scope Type <span className="text-red-500">*</span></Label>
            <Controller
              control={control}
              name="scopeType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORGANIZATION">Organization - All Assets</SelectItem>
                    <SelectItem value="DEPARTMENT">Department - Specific Department Assets</SelectItem>
                    <SelectItem value="LOCATION">Location - Assets at specific location</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Conditional Scope Department */}
          {scopeType === "DEPARTMENT" && (
            <div className="space-y-1.5">
              <Label>Scope Department <span className="text-red-500">*</span></Label>
              <Controller
                control={control}
                name="departmentId"
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.departmentId ? "border-red-400" : ""}>
                      <SelectValue placeholder="Select scoped department" />
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
          )}

          {/* Conditional Scope Location */}
          {scopeType === "LOCATION" && (
            <div className="space-y-1.5">
              <Label htmlFor="scope-location">Scope Location <span className="text-red-500">*</span></Label>
              <Input
                id="scope-location"
                placeholder="e.g. London Office, Floor 3"
                className={errors.location ? "border-red-400" : ""}
                {...register("location")}
              />
              {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
            </div>
          )}

          {/* Dates Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="start-date">Start Date & Time <span className="text-red-500">*</span></Label>
              <Input
                id="start-date"
                type="datetime-local"
                className={errors.startDate ? "border-red-400" : ""}
                {...register("startDate")}
              />
              {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end-date">End Date & Time <span className="text-red-500">*</span></Label>
              <Input
                id="end-date"
                type="datetime-local"
                className={errors.endDate ? "border-red-400" : ""}
                {...register("endDate")}
              />
              {errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="audit-desc">Audit Description</Label>
            <Textarea
              id="audit-desc"
              placeholder="Provide context, instructions for physical verifiers, etc..."
              rows={2}
              {...register("description")}
            />
          </div>

          {/* Assign Auditors checklist */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1">
                <Users className="h-4 w-4 text-slate-400" /> Assign Auditors <span className="text-red-500">*</span>
              </Label>
              <span className="text-[10px] text-[#4262ff] font-bold bg-[#4262ff]/8 px-2 py-0.5 rounded-full">
                {selectedAuditors.length} Selected
              </span>
            </div>
            {errors.auditorIds && <p className="text-xs text-red-500">{errors.auditorIds.message}</p>}

            {/* Auditor search input */}
            <div className="relative">
              <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search auditor name or email..."
                value={auditorSearch}
                onChange={(e) => setAuditorSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            {/* Listbox */}
            <div className="border border-slate-200 rounded-xl max-h-36 overflow-y-auto p-2 bg-slate-50/50 space-y-1">
              {filteredAuditors.map((emp) => {
                const checked = selectedAuditors.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white transition-colors text-xs font-semibold text-slate-700"
                  >
                    <Checkbox
                      id={`auditor-${emp.id}`}
                      checked={checked}
                      onCheckedChange={(c: boolean) => handleToggleAuditor(emp.id, c)}
                    />
                    <label htmlFor={`auditor-${emp.id}`} className="flex-1 truncate cursor-pointer">
                      {emp.name} <span className="text-[10px] text-slate-400 font-medium">({emp.email})</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy} className="rounded-full bg-[#4262ff] hover:bg-[#3451e0] text-white">
              {isBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Cycle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
