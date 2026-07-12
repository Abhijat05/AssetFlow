import React, { useMemo } from "react";
import { X, SlidersHorizontal, User, Building, Calendar, Package } from "lucide-react";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { useDepartments, useEmployees } from "../../organization/hooks/useOrganization";
import type { AuditQuery, AuditStatus } from "../types";

const STATUSES: { value: AuditStatus; label: string }[] = [
  { value: "PLANNED", label: "Planned" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

interface Props {
  filters: AuditQuery;
  onChange: (filters: Partial<AuditQuery>) => void;
  onReset: () => void;
}

export const AuditFilters: React.FC<Props> = ({ filters, onChange, onReset }) => {
  const { data: departments = [] } = useDepartments();
  const { data: employeesData } = useEmployees({ limit: 100 });
  const employees = useMemo(() => employeesData?.data ?? [], [employeesData]);

  const hasActiveFilters = !!(
    filters.status ||
    filters.departmentId ||
    filters.location ||
    filters.auditorId ||
    filters.startDate ||
    filters.endDate
  );

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
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Package className="h-3.5 w-3.5 text-slate-400" /> Status
        </Label>
        <Select
          value={filters.status || "all"}
          onValueChange={(v) => onChange({ status: v === "all" ? undefined : (v as AuditStatus) })}
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

      {/* Department Filter */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Building className="h-3.5 w-3.5 text-slate-400" /> Department
        </Label>
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

      {/* Location Filter */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Building className="h-3.5 w-3.5 text-slate-400" /> Location
        </Label>
        <Input
          placeholder="Location keyword..."
          className="h-9 text-sm"
          value={filters.location || ""}
          onChange={(e) => onChange({ location: e.target.value || undefined })}
        />
      </div>

      {/* Assigned Auditor Filter */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <User className="h-3.5 w-3.5 text-slate-400" /> Auditor
        </Label>
        <Select
          value={filters.auditorId || "all"}
          onValueChange={(v) => onChange({ auditorId: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="All auditors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All auditors</SelectItem>
            {employees.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Start */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-slate-400" /> Start From
        </Label>
        <Input
          type="date"
          className="h-9 text-sm"
          value={filters.startDate || ""}
          onChange={(e) => onChange({ startDate: e.target.value || undefined })}
        />
      </div>

      {/* Date Range End */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-slate-400" /> Start To
        </Label>
        <Input
          type="date"
          className="h-9 text-sm"
          value={filters.endDate || ""}
          onChange={(e) => onChange({ endDate: e.target.value || undefined })}
        />
      </div>
    </div>
  );
};
