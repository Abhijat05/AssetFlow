import React from "react";
import { Input } from "../../../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import type { ActivityQuery, ActivityModule } from "../types";
import type { UserRole } from "../../../types/auth";

interface DropdownItem {
  id: string;
  name: string;
}

interface ActivityFiltersProps {
  filters: ActivityQuery;
  onChange: (filters: ActivityQuery) => void;
  userRole: UserRole;
  users: DropdownItem[];
}

const MODULES: { value: ActivityModule; label: string }[] = [
  { value: "ASSETS", label: "Assets" },
  { value: "ALLOCATIONS", label: "Allocations" },
  { value: "BOOKINGS", label: "Bookings" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "AUDITS", label: "Audits" },
  { value: "ORGANIZATION", label: "Organization" },
  { value: "AUTH", label: "Authentication" },
  { value: "SYSTEM", label: "System Logs" },
];

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  filters,
  onChange,
  userRole,
  users,
}) => {
  const isEmployee = userRole === "EMPLOYEE";

  const handleFilterChange = (key: keyof ActivityQuery, value: string | undefined) => {
    onChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
    });
  };

  const handleReset = () => {
    onChange({
      module: undefined,
      userId: undefined,
      action: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      search: filters.search, // preserve search text
      page: 1,
      limit: filters.limit,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm animate-reveal">
      <div className="flex items-center gap-2 text-primary font-bold text-sm">
        <Filter className="h-4 w-4 text-brand-blue" />
        <span>Filter Activity Logs</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Module */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Module</label>
          <Select
            value={filters.module || "all"}
            onValueChange={(val) => handleFilterChange("module", val)}
          >
            <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 bg-white">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              <SelectItem value="all" className="text-xs font-semibold">All Modules</SelectItem>
              {MODULES.map((m) => (
                <SelectItem key={m.value} value={m.value} className="text-xs font-medium">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User (Hidden for Employees) */}
        {!isEmployee && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Triggered By</label>
            <Select
              value={filters.userId || "all"}
              onValueChange={(val) => handleFilterChange("userId", val)}
            >
              <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="all" className="text-xs font-semibold">All Users</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id} className="text-xs font-medium">
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Action Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Type</label>
          <Input
            placeholder="e.g. CREATE, UPDATE"
            className="h-9 text-xs rounded-xl border-slate-200"
            value={filters.action || ""}
            onChange={(e) => handleFilterChange("action", e.target.value || undefined)}
          />
        </div>

        {/* Date From */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date From</label>
          <Input
            type="date"
            className="h-9 text-xs rounded-xl border-slate-200"
            value={filters.dateFrom || ""}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value || undefined)}
          />
        </div>

        {/* Date To */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date To</label>
          <Input
            type="date"
            className="h-9 text-xs rounded-xl border-slate-200"
            value={filters.dateTo || ""}
            onChange={(e) => handleFilterChange("dateTo", e.target.value || undefined)}
          />
        </div>

        {/* Reset Button (placed at bottom right or fits in grid) */}
        <div className="flex items-end sm:col-span-2 md:col-span-3 lg:col-span-5 justify-end">
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-9 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs gap-1.5 px-6"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ActivityFilters;
