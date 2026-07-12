export type BookingStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface BookingRecord {
  id: string;
  assetId: string;
  bookedBy: string;
  departmentId: string;
  title: string;
  purpose: string | null;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Derives status purely from timestamps — does not account for CANCELLED
export function deriveStatus(startTime: Date, endTime: Date): Exclude<BookingStatus, "CANCELLED"> {
  const now = new Date();
  if (now < startTime) return "UPCOMING";
  if (now <= endTime) return "ONGOING";
  return "COMPLETED";
}
