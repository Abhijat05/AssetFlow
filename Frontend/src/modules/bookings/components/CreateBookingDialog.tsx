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
import { useCreateBooking, useUpdateBooking } from "../hooks/useBookings";
import { useAssets } from "../../assets/hooks/useAssets";
import { useDepartments } from "../../organization/hooks/useOrganization";
import { useAuth } from "../../../context/AuthContext";
import { CalendarRange, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { Booking } from "../types";

const schema = z
  .object({
    assetId: z.string().min(1, "Bookable resource is required"),
    departmentId: z.string().min(1, "Department is required"),
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    purpose: z.string().max(1000, "Purpose is too long").optional().nullable(),
    startTime: z.string().min(1, "Start date & time is required"),
    endTime: z.string().min(1, "End date & time is required"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return end > start;
    },
    {
      message: "End date and time must be after the start time",
      path: ["endTime"],
    }
  );

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking | null; // If provided, runs in Edit mode
  defaultDate?: Date | null;
  defaultResourceId?: string | null;
}

export const CreateBookingDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  booking,
  defaultDate,
  defaultResourceId,
}) => {
  const { user } = useAuth();
  
  // Load bookable resources
  const { data: assetsData } = useAssets({ isBookable: true, limit: 100 });
  const resources = useMemo(() => assetsData?.data ?? [], [assetsData]);

  // Load departments
  const { data: departments = [] } = useDepartments();

  const createBooking = useCreateBooking();
  const updateBooking = useUpdateBooking(booking?.id || "");

  const isEdit = !!booking;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      assetId: "",
      departmentId: "",
      title: "",
      purpose: "",
      startTime: "",
      endTime: "",
    },
  });

  // Pre-populate fields on load/edit
  useEffect(() => {
    if (open) {
      if (booking) {
        // Edit mode prep
        setValue("assetId", booking.assetId);
        setValue("departmentId", booking.departmentId || "");
        setValue("title", booking.title);
        setValue("purpose", booking.purpose || "");
        
        // Format to YYYY-MM-DDTHH:MM for datetime-local input
        const formatLocal = (isoStr: string) => {
          try {
            return format(new Date(isoStr), "yyyy-MM-dd'T'HH:mm");
          } catch {
            return "";
          }
        };
        setValue("startTime", formatLocal(booking.startTime));
        setValue("endTime", formatLocal(booking.endTime));
      } else {
        // Create mode prep
        const baseStart = defaultDate || new Date(Date.now() + 60 * 60 * 1000);
        // Ensure default hour is set sensibly if clicking from calendar
        if (defaultDate) {
          baseStart.setHours(9, 0, 0, 0); // 9:00 AM default for calendar cell clicks
        }
        const baseEnd = new Date(baseStart.getTime() + 60 * 60 * 1000); // 1 Hour duration

        reset({
          assetId: defaultResourceId || "",
          departmentId: (user as unknown as { departmentId?: string })?.departmentId || "",
          title: "",
          purpose: "",
          startTime: format(baseStart, "yyyy-MM-dd'T'HH:mm"),
          endTime: format(baseEnd, "yyyy-MM-dd'T'HH:mm"),
        });
      }
    }
  }, [open, booking, defaultDate, defaultResourceId, user, setValue, reset]);

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      // Format datetime-local to standard ISO timezone-offset format
      const startTimeIso = new Date(values.startTime).toISOString();
      const endTimeIso = new Date(values.endTime).toISOString();

      if (isEdit && booking) {
        await updateBooking.mutateAsync({
          title: values.title,
          purpose: values.purpose,
          startTime: startTimeIso,
          endTime: endTimeIso,
        });
      } else {
        await createBooking.mutateAsync({
          assetId: values.assetId,
          departmentId: values.departmentId,
          title: values.title,
          purpose: values.purpose || null,
          startTime: startTimeIso,
          endTime: endTimeIso,
        });
      }
      handleClose();
    } catch {
      // Handled by TanStack mutation toast notification
    }
  };

  const isBusy = isSubmitting || createBooking.isPending || updateBooking.isPending;
  const mutationError = isEdit ? updateBooking.error : createBooking.error;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-canvas">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#4262ff]/10 flex items-center justify-center">
              <CalendarRange className="h-5 w-5 text-[#4262ff]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-ink">
                {isEdit ? "Edit Booking" : "Create Booking"}
              </DialogTitle>
              <DialogDescription className="text-sm text-ink-subtle">
                {isEdit ? "Update details of your existing resource reservation." : "Reserve rooms, vehicles, or equipment for shared use."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {mutationError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 flex items-start gap-2.5 text-red-800 text-xs">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Failed to save:</span> {mutationError.message}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Resource Selection */}
          <div className="space-y-1.5">
            <Label>Bookable Resource <span className="text-red-500">*</span></Label>
            <Controller
              control={control}
              name="assetId"
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange} disabled={isEdit}>
                  <SelectTrigger className={errors.assetId ? "border-red-400" : ""}>
                    <SelectValue placeholder="Select resource to book" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((res) => (
                      <SelectItem key={res.id} value={res.id}>
                        {res.name} ({res.assetTag})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assetId && <p className="text-xs text-red-500">{errors.assetId.message}</p>}
          </div>

          {/* Department Selection */}
          <div className="space-y-1.5">
            <Label>Charging Department <span className="text-red-500">*</span></Label>
            <Controller
              control={control}
              name="departmentId"
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange} disabled={isEdit}>
                  <SelectTrigger className={errors.departmentId ? "border-red-400" : ""}>
                    <SelectValue placeholder="Select charging department" />
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

          {/* Booking Title */}
          <div className="space-y-1.5">
            <Label htmlFor="booking-title">Booking Title <span className="text-red-500">*</span></Label>
            <Input
              id="booking-title"
              placeholder="e.g. Project Alignment Meeting"
              className={errors.title ? "border-red-400" : ""}
              {...register("title")}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Start Date & Time */}
          <div className="space-y-1.5">
            <Label htmlFor="start-time">Start Date & Time <span className="text-red-500">*</span></Label>
            <Input
              id="start-time"
              type="datetime-local"
              className={errors.startTime ? "border-red-400" : ""}
              {...register("startTime")}
            />
            {errors.startTime && <p className="text-xs text-red-500">{errors.startTime.message}</p>}
          </div>

          {/* End Date & Time */}
          <div className="space-y-1.5">
            <Label htmlFor="end-time">End Date & Time <span className="text-red-500">*</span></Label>
            <Input
              id="end-time"
              type="datetime-local"
              className={errors.endTime ? "border-red-400" : ""}
              {...register("endTime")}
            />
            {errors.endTime && <p className="text-xs text-red-500">{errors.endTime.message}</p>}
          </div>

          {/* Purpose / Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="purpose">Purpose / Booking Details</Label>
            <Textarea
              id="purpose"
              placeholder="Details about reservation, guests list or specific setup..."
              rows={3}
              {...register("purpose")}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy} className="rounded-full bg-[#4262ff] hover:bg-[#3451e0] text-white">
              {isBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Update Booking" : "Create Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
