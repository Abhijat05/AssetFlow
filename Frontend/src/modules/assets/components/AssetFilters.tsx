import React from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { useDepartments, useCategories } from "../../organization/hooks/useOrganization";
import type { AssetQuery, AssetCondition, AssetStatus } from "../types";

const CONDITIONS: { value: AssetCondition; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
  { value: "DAMAGED", label: "Damaged" },
];

const STATUSES: { value: AssetStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "IN_USE", label: "In Use" },
  { value: "UNDER_MAINTENANCE", label: "Under Maintenance" },
  { value: "RETIRED", label: "Retired" },
  { value: "LOST", label: "Lost" },
];

interface Props {
  filters: Pick<AssetQuery, "categoryId" | "departmentId" | "status" | "condition" | "isBookable">;
  onChange: (filters: Partial<AssetQuery>) => void;
  onReset: () => void;
}

export const AssetFilters: React.FC<Props> = ({ filters, onChange, onReset }) => {
  const { data: categories = [] } = useCategories();
  const { data: departments = [] } = useDepartments();

  const hasActiveFilters = !!(filters.categoryId || filters.departmentId || filters.status || filters.condition || filters.isBookable !== undefined);

  return (
    <div className="w-64 flex-shrink-0 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-bold text-ink">Filters</span>
          {hasActiveFilters && (
            <span className="h-5 w-5 rounded-full bg-brand-blue text-white text-[10px] font-bold flex items-center justify-center">
              !
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</Label>
        <Select
          value={filters.categoryId || "all"}
          onValueChange={(v) => onChange({ categoryId: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Department */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</Label>
        <Select
          value={filters.departmentId || "all"}
          onValueChange={(v) => onChange({ departmentId: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</Label>
        <Select
          value={filters.status || "all"}
          onValueChange={(v) => onChange({ status: v === "all" ? undefined : (v as AssetStatus) })}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Condition</Label>
        <Select
          value={filters.condition || "all"}
          onValueChange={(v) => onChange({ condition: v === "all" ? undefined : (v as AssetCondition) })}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="All conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All conditions</SelectItem>
            {CONDITIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bookable */}
      <div className="flex items-center justify-between py-1">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bookable only</Label>
        <Switch
          checked={filters.isBookable === true}
          onCheckedChange={(checked: boolean) => onChange({ isBookable: checked ? true : undefined })}
        />
      </div>
    </div>
  );
};
