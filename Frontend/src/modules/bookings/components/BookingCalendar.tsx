import React, { useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Plus, Info } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useAssets } from "../../assets/hooks/useAssets";
import { useCalendarBookings } from "../hooks/useBookings";
import type { Booking, CalendarBooking } from "../types";

const formatSafeDate = (dateStr: string | null | undefined, template: string = "MMM d, yyyy · h:mm a") => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return format(d, template);
  } catch {
    return "—";
  }
};

interface Props {
  onQuickBook: (date: Date, resourceId: string) => void;
  onViewDetail: (id: string) => void;
}

export const BookingCalendar: React.FC<Props> = ({ onQuickBook, onViewDetail }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedResourceId, setSelectedResourceId] = useState<string>("all");

  // Load resources for the calendar filter
  const { data: assetsData } = useAssets({ isBookable: true, limit: 100 });
  const resources = useMemo(() => assetsData?.data ?? [], [assetsData]);

  // Derive active bookable resource
  const activeResourceId = useMemo(() => {
    if (selectedResourceId !== "all") return selectedResourceId;
    return resources.length > 0 ? resources[0].id : "all";
  }, [selectedResourceId, resources]);

  // Compute month start and end interval for API query
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Fetch calendar bookings for the selected asset within this time range
  const { data: calendarEvents = [] } = useCalendarBookings(
    activeResourceId === "all" ? "" : activeResourceId,
    calendarStart.toISOString(),
    calendarEnd.toISOString()
  );

  // Calendar dates grid calculation
  const days = useMemo(() => {
    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });
  }, [calendarStart, calendarEnd]);

  // Get status color pill
  const getEventClass = (status: Booking["status"]) => {
    switch (status) {
      case "UPCOMING":
        return "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300";
      case "ONGOING":
        return "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300";
      case "COMPLETED":
        return "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300";
      default:
        return "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-300";
    }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const selectedResource = resources.find((r) => r.id === activeResourceId);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Calendar Header / Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#4262ff]/10 flex items-center justify-center text-[#4262ff]">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">{format(currentDate, "MMMM yyyy")}</h2>
            <p className="text-xs text-ink-subtle">Click a cell to make a booking reservation</p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="w-48">
            <Select value={activeResourceId} onValueChange={setSelectedResourceId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filter by Resource" />
              </SelectTrigger>
              <SelectContent>
                {resources.map((res) => (
                  <SelectItem key={res.id} value={res.id}>
                    {res.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center border border-slate-200 rounded-full p-0.5 bg-slate-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="h-7 w-7 p-0 rounded-full hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="px-3 h-7 rounded-full text-xs font-semibold hover:bg-white"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-7 w-7 p-0 rounded-full hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50">
        {/* Days of Week */}
        <div className="grid grid-cols-7 border-b border-slate-150 bg-slate-100/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <div
              key={dayName}
              className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-7 bg-slate-150 gap-[1px]">
          {days.map((day, idx) => {
            const inMonth = isSameMonth(day, currentDate);
            
            // Filter events for this day
            const dayEvents = calendarEvents.filter((ev: CalendarBooking) => {
              const start = parseISO(ev.booking.startTime);
              const end = parseISO(ev.booking.endTime);
              return isSameDay(start, day) || isSameDay(end, day) || (day > start && day < end);
            });

            return (
              <div
                key={idx}
                className={`min-h-[100px] p-2 flex flex-col justify-between bg-white relative transition-colors ${
                  !inMonth ? "bg-slate-50/60 text-slate-400" : ""
                } ${isToday(day) ? "bg-[#4262ff]/3" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${
                      isToday(day)
                        ? "bg-[#4262ff] text-white"
                        : inMonth
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {activeResourceId !== "all" && (
                    <button
                      onClick={() => onQuickBook(day, activeResourceId)}
                      className="opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100 absolute top-1 right-1 p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-ink transition-all cursor-pointer"
                      title="Quick Book Resource"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Day Events list */}
                <div className="mt-2 space-y-1 overflow-y-auto max-h-[70px]">
                  {dayEvents.map((ev: CalendarBooking) => {
                    const b = ev.booking;
                    return (
                      <button
                        key={b.id}
                        onClick={() => onViewDetail(b.id)}
                        className={`w-full text-left text-[10px] font-semibold px-2 py-0.5 rounded border truncate transition-all cursor-pointer ${getEventClass(
                          b.status
                        )}`}
                        title={`${b.title}\n(${formatSafeDate(b.startTime, "p")} - ${formatSafeDate(
                          b.endTime,
                          "p"
                        )})`}
                      >
                        {formatSafeDate(b.startTime, "h:mm a")} - {b.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Legend:</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Upcoming</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Ongoing</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Completed</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Cancelled</span>
        </div>
        {selectedResource && (
          <div className="text-slate-500 flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-[#4262ff]" />
            Viewing bookings for <span className="font-semibold text-ink">{selectedResource.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
