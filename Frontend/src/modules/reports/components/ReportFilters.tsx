import React from "react";
import { Input } from "../../../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import type { ReportFilters as FiltersType } from "../types";
import type { UserRole } from "../../../types/auth";

interface DropdownItem {
  id: string;
  name: string;
}

interface ReportFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
  userRole: UserRole;
  userDeptId: string | null;
  departments: DropdownItem[];
  categories: DropdownItem[];
  assets: DropdownItem[];
  locations: string[];
  employees: DropdownItem[];
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onChange,
  userRole,
  userDeptId,
  departments,
  categories,
  assets,
  locations,
  employees,
}) => {
  const isDeptHead = userRole === "DEPARTMENT_HEAD";

  // Handle individual filter changes
  const handleFilterChange = (key: keyof FiltersType, value: string | undefined) => {
    onChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
    });
  };

  const handleReset = () => {
    onChange({
      departmentId: isDeptHead ? (userDeptId || undefined) : undefined,
      categoryId: undefined,
      assetId: undefined,
      employeeId: undefined,
      location: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm animate-reveal">
      <div className="flex items-center gap-2 text-[#050038] font-bold text-sm">
        <Filter className="h-4 w-4 text-[#4262ff]" />
        <span>Report Query Filters</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Date From */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date From</label>
          <Input
            type="date"
            className="h-9 text-xs rounded-xl border-slate-200 focus-visible:ring-[#4262ff]"
            value={filters.dateFrom || ""}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value || undefined)}
          />
        </div>

        {/* Date To */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date To</label>
          <Input
            type="date"
            className="h-9 text-xs rounded-xl border-slate-200 focus-visible:ring-[#4262ff]"
            value={filters.dateTo || ""}
            onChange={(e) => handleFilterChange("dateTo", e.target.value || undefined)}
          />
        </div>

        {/* Department (Locked for Dept Head) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</label>
          {isDeptHead ? (
            <div className="h-9 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold truncate">
              {departments.find((d) => d.id === userDeptId)?.name || "My Department"}
            </div>
          ) : (
            <Select
              value={filters.departmentId || "all"}
              onValueChange={(val) => handleFilterChange("departmentId", val)}
            >
              <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                <SelectItem value="all" className="text-xs font-semibold">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id} className="text-xs font-medium">
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset Category</label>
          <Select
            value={filters.categoryId || "all"}
            onValueChange={(val) => handleFilterChange("categoryId", val)}
          >
            <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              <SelectItem value="all" className="text-xs font-semibold">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs font-medium">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Asset */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specific Asset</label>
          <Select
            value={filters.assetId || "all"}
            onValueChange={(val) => handleFilterChange("assetId", val)}
          >
            <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200">
              <SelectValue placeholder="All Assets" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              <SelectItem value="all" className="text-xs font-semibold">All Assets</SelectItem>
              {assets.map((a) => (
                <SelectItem key={a.id} value={a.id} className="text-xs font-medium">
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
          <Select
            value={filters.location || "all"}
            onValueChange={(val) => handleFilterChange("location", val)}
          >
            <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              <SelectItem value="all" className="text-xs font-semibold">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc} className="text-xs font-medium">
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Employee */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee</label>
          <Select
            value={filters.employeeId || "all"}
            onValueChange={(val) => handleFilterChange("employeeId", val)}
          >
            <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              <SelectItem value="all" className="text-xs font-semibold">All Employees</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id} className="text-xs font-medium">
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-9 w-full rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ReportFilters;
