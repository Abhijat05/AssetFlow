import React, { useState, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { AppShell } from "../../../pages/DashboardPlaceholder";
import { useBookings, useCancelBooking } from "../hooks/useBookings";
import { BookingFilters } from "../components/BookingFilters";
import { BookingTable } from "../components/BookingTable";
import { BookingCalendar } from "../components/BookingCalendar";
import { CreateBookingDialog } from "../components/CreateBookingDialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Plus, Search, Calendar, ListFilter } from "lucide-react";
import type { Booking, BookingQuery } from "../types";

const PAGE_LIMIT = 10;

export const BookingDirectory: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user?.id || "";
  const userRole = user?.role || "EMPLOYEE";

  // Tab View state: "calendar" | "table"
  const [activeTab, setActiveTab] = useState<"calendar" | "table">("calendar");

  // Search & Filters State
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Partial<BookingQuery>>({});
  const [page, setPage] = useState(1);

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Quick book helper when calendar day cell is clicked
  const [quickBookDate, setQuickBookDate] = useState<Date | null>(null);
  const [quickBookResourceId, setQuickBookResourceId] = useState<string>("");

  // Construct query payload
  const query: BookingQuery = useMemo(() => {
    return {
      search: search || undefined,
      resourceId: filters.resourceId,
      departmentId: filters.departmentId,
      bookedBy: filters.bookedBy,
      status: filters.status,
      // Convert start/end range dates to ISO timezone strings
      startDate: filters.startDate ? new Date(filters.startDate).toISOString() : undefined,
      endDate: filters.endDate ? new Date(filters.endDate).toISOString() : undefined,
      page,
      limit: PAGE_LIMIT,
      sortBy: "startTime",
      sortOrder: "asc",
    };
  }, [search, filters, page]);

  // Load Bookings
  const { data: bookingsData, isLoading } = useBookings(query);
  const bookings = bookingsData?.data ?? [];
  const meta = bookingsData?.meta;

  const cancelMutation = useCancelBooking();

  const handleFilterChange = (newFilters: Partial<BookingQuery>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilters({});
    setPage(1);
  };

  const handleCancelBooking = async (b: Booking, reason: string) => {
    await cancelMutation.mutateAsync({ id: b.id, reason });
  };

  const handleOpenEdit = (b: Booking) => {
    setEditingBooking(b);
    setIsCreateOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingBooking(null);
    setIsCreateOpen(true);
  };

  const handleQuickBook = (date: Date, resourceId: string) => {
    setEditingBooking(null);
    setQuickBookDate(date);
    setQuickBookResourceId(resourceId);
    setIsCreateOpen(true);
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-canvas">
        {/* Top Header */}
        <div className="border-b border-slate-200 bg-white">
          <div className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-ink">Resource Bookings</h1>
              <p className="text-sm text-ink-subtle mt-0.5">
                Reserve shared facilities, meeting rooms, vehicles, and company equipment.
              </p>
            </div>
            <Button
              onClick={handleOpenCreate}
              className="w-fit rounded-full bg-[#4262ff] hover:bg-[#3451e0] text-white font-semibold flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Reserve Resource
            </Button>
          </div>
        </div>

        {/* Directory Layout */}
        <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-6">
          {/* Side panel filters */}
          <BookingFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Main workspace container */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Search Bar & Tab Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3.5 border border-slate-200 rounded-2xl shadow-sm">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search bookings title or purpose..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 h-9"
                />
              </div>

              {/* View Selector Tabs */}
              <div className="flex items-center gap-1.5 border border-slate-200 p-1 rounded-full bg-slate-50 self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "calendar"
                      ? "bg-white text-[#4262ff] shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" /> Calendar View
                </button>
                <button
                  onClick={() => setActiveTab("table")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "table"
                      ? "bg-white text-[#4262ff] shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <ListFilter className="h-3.5 w-3.5" /> Booking List
                </button>
              </div>
            </div>

            {/* Display active tab */}
            {activeTab === "calendar" ? (
              <BookingCalendar
                onQuickBook={handleQuickBook}
                onViewDetail={(id) => {
                  window.location.href = `/bookings/${id}`;
                }}
              />
            ) : (
              <BookingTable
                data={bookings}
                isLoading={isLoading}
                page={page}
                totalPages={meta?.totalPages ?? 1}
                onPageChange={setPage}
                total={meta?.total ?? 0}
                userRole={userRole}
                currentUserId={currentUserId}
                onEdit={handleOpenEdit}
                onCancel={handleCancelBooking}
              />
            )}
          </div>
        </div>

        {/* Dialog Modulator */}
        {isCreateOpen && (
          <CreateBookingDialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setEditingBooking(null);
                setQuickBookDate(null);
                setQuickBookResourceId("");
              }
            }}
            booking={editingBooking}
            defaultDate={quickBookDate}
            defaultResourceId={quickBookResourceId}
          />
        )}
      </div>
    </AppShell>
  );
};
