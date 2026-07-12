export type BookingStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface BookingHistoryEntry {
  id: string;
  bookingId: string;
  action: string;
  description: string;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  assetId: string;
  resource: {
    id: string;
    name: string;
    assetTag: string;
    photoUrl: string | null;
  };
  bookedBy: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  departmentId: string | null;
  department: {
    id: string;
    name: string;
  } | null;
  title: string;
  purpose: string | null;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  status: BookingStatus;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  history?: BookingHistoryEntry[];
}

export interface BookingQuery {
  search?: string;
  resourceId?: string;
  departmentId?: string;
  bookedBy?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedBookings {
  success: boolean;
  data: Booking[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateBookingInput {
  assetId: string;
  departmentId: string;
  title: string;
  purpose?: string | null;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
}

export interface UpdateBookingInput {
  title?: string;
  purpose?: string | null;
  startTime?: string;
  endTime?: string;
}

export interface CalendarBooking {
  booking: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    bookedBy: string;
    status: BookingStatus;
  };
  bookerName: string;
  departmentName: string;
}
