import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bookingApi } from "../services/api";
import type { BookingQuery, CreateBookingInput, UpdateBookingInput } from "../types";

export const BOOKINGS_KEY = "bookings";
export const BOOKING_KEY = (id: string) => ["booking", id];
export const BOOKING_HISTORY_KEY = (id: string) => ["booking-history", id];
export const BOOKING_CALENDAR_KEY = (assetId: string) => ["booking-calendar", assetId];

export function useBookings(query: BookingQuery) {
  return useQuery({
    queryKey: [BOOKINGS_KEY, query],
    queryFn: () => bookingApi.getBookings(query),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: BOOKING_KEY(id),
    queryFn: () => bookingApi.getBookingById(id),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useBookingHistory(bookingId: string) {
  return useQuery({
    queryKey: BOOKING_HISTORY_KEY(bookingId),
    queryFn: () => bookingApi.getHistory(bookingId),
    enabled: !!bookingId,
    select: (res) => res.data,
  });
}

export function useCalendarBookings(assetId: string, from?: string, to?: string) {
  return useQuery({
    queryKey: [BOOKING_CALENDAR_KEY(assetId), from, to],
    queryFn: () => bookingApi.getCalendarBookings(assetId, from, to),
    enabled: !!assetId,
    select: (res) => res.data,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingInput) => bookingApi.createBooking(data),
    onSuccess: () => {
      toast.success("Booking created successfully!");
      qc.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create booking");
    },
  });
}

export function useUpdateBooking(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBookingInput) => bookingApi.updateBooking(id, data),
    onSuccess: () => {
      toast.success("Booking updated successfully!");
      qc.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
      qc.invalidateQueries({ queryKey: BOOKING_KEY(id) });
      qc.invalidateQueries({ queryKey: [BOOKING_CALENDAR_KEY] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update booking");
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => bookingApi.cancelBooking(id, reason),
    onSuccess: (_, variables) => {
      toast.success("Booking cancelled successfully!");
      qc.invalidateQueries({ queryKey: [BOOKINGS_KEY] });
      qc.invalidateQueries({ queryKey: BOOKING_KEY(variables.id) });
      qc.invalidateQueries({ queryKey: [BOOKING_CALENDAR_KEY] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to cancel booking");
    },
  });
}
