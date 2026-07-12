import { z } from "zod";

const bookingStatuses = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"] as const;

export const createBookingSchema = z
  .object({
    assetId: z.string().min(1, "Asset is required"),
    departmentId: z.string().min(1, "Department is required"),
    title: z.string().min(1, "Title is required").max(200),
    purpose: z.string().max(1000).optional().nullable(),
    startTime: z
      .string()
      .datetime({ offset: true })
      .refine((v) => new Date(v) > new Date(), "Start time must be in the future"),
    endTime: z.string().datetime({ offset: true }),
  })
  .refine((d) => new Date(d.endTime) > new Date(d.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const updateBookingSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    purpose: z.string().max(1000).optional().nullable(),
    startTime: z
      .string()
      .datetime({ offset: true })
      .refine((v) => new Date(v) > new Date(), "Start time must be in the future")
      .optional(),
    endTime: z.string().datetime({ offset: true }).optional(),
  })
  .refine(
    (d) => {
      if (d.startTime && d.endTime) return new Date(d.endTime) > new Date(d.startTime);
      return true;
    },
    { message: "End time must be after start time", path: ["endTime"] }
  );

export const cancelBookingSchema = z.object({
  cancelReason: z.string().max(1000).optional().nullable(),
});

export const bookingQuerySchema = z.object({
  assetId: z.string().optional(),
  bookedBy: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.enum(bookingStatuses).optional(),
  startFrom: z.string().datetime({ offset: true }).optional(),
  startTo: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["startTime", "endTime", "createdAt", "title"]).default("startTime"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const calendarQuerySchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type BookingQueryInput = z.infer<typeof bookingQuerySchema>;
export type CalendarQueryInput = z.infer<typeof calendarQuerySchema>;
