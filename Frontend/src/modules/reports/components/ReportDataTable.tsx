import React, { useState, useMemo } from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn } from "../../../lib/utils";

export interface ColumnDefinition {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ReportDataTableProps {
  columns: ColumnDefinition[];
  data: any[];
  searchPlaceholder?: string;
  defaultPageSize?: number;
}

export const ReportDataTable: React.FC<ReportDataTableProps> = ({
  columns,
  data,
  searchPlaceholder = "Search records...",
  defaultPageSize = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  
  // Track visible columns. Initially all are visible.
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    columns.forEach((col) => {
      initial[col.key] = true;
    });
    return initial;
  });

  // Toggle column visibility
  const toggleColumn = (key: string) => {
    setVisibleKeys((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      // Ensure at least one column remains visible
      const visibleCount = Object.values(updated).filter(Boolean).length;
      return visibleCount > 0 ? updated : prev;
    });
  };

  // Filter columns list
  const activeColumns = useMemo(() => {
    return columns.filter((col) => visibleKeys[col.key]);
  }, [columns, visibleKeys]);

  // Handle header click for sorting
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Filter and Sort Data
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Search filter (case-insensitive checks across all keys in object)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter((row) => {
        return Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(term);
        });
      });
    }

    // 2. Sort filter
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
        if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortKey, sortOrder]);

  // Pagination calculations
  const totalRecords = processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  
  // Adjust current page if filters shrink pages count
  const adjustedCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (adjustedCurrentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, adjustedCurrentPage, pageSize]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm animate-reveal overflow-hidden flex flex-col">
      {/* Table Controls (Search & Column Visibility) */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-9 text-xs rounded-xl border-slate-200 bg-white focus-visible:ring-[#4262ff]"
          />
        </div>

        {/* Custom Column Visibility Dropdown */}
        <div className="relative w-full sm:w-auto shrink-0 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColumnDropdown(!showColumnDropdown)}
            className="h-9 text-xs rounded-xl border-slate-200 text-slate-600 gap-1.5 font-bold w-full sm:w-auto bg-white"
          >
            <EyeOff className="h-3.5 w-3.5" />
            Columns visibility
            <ChevronDown className="h-3 w-3 ml-0.5" />
          </Button>

          {showColumnDropdown && (
            <>
              {/* Overlay to close on click outside */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setShowColumnDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-lg p-2 space-y-0.5 z-50 animate-reveal">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2.5 py-1">
                  Toggle Columns
                </p>
                <div className="h-px bg-slate-100 my-1" />
                <div className="max-h-[200px] overflow-y-auto pr-1 space-y-0.5">
                  {columns.map((col) => {
                    const isVisible = visibleKeys[col.key];
                    return (
                      <button
                        key={col.key}
                        onClick={() => toggleColumn(col.key)}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors",
                          isVisible ? "text-[#050038] hover:bg-slate-50" : "text-slate-400 hover:bg-slate-50/50"
                        )}
                      >
                        <span>{col.label}</span>
                        {isVisible && <Check className="h-3.5 w-3.5 text-[#4262ff]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table Element */}
      <div className="flex-1 overflow-x-auto min-h-[180px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/20">
              {activeColumns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer select-none hover:text-[#050038] transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {isSorted ? (
                        sortOrder === "asc" ? (
                          <ChevronUp className="h-3 w-3 text-[#4262ff]" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-[#4262ff]" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length} className="p-10 text-center text-xs text-slate-400 font-medium">
                  No records match your query.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-slate-50/40 transition-colors"
                >
                  {activeColumns.map((col) => {
                    const value = row[col.key];
                    return (
                      <td key={col.key} className="p-4 text-xs font-semibold text-slate-700">
                        {col.render ? col.render(value, row) : (value !== null && value !== undefined ? String(value) : "—")}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-500 bg-slate-50/30">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Page size</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-8 rounded-lg border border-slate-200 px-2 py-1 text-xs bg-white text-slate-700 outline-none"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} rows
              </option>
            ))}
          </select>
          <span className="text-slate-400 font-medium ml-2">
            Showing {totalRecords > 0 ? (adjustedCurrentPage - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(adjustedCurrentPage * pageSize, totalRecords)} of {totalRecords} records
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, adjustedCurrentPage - 1))}
            disabled={adjustedCurrentPage === 1}
            className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
            // Simple windowed page numbers around adjustedCurrentPage
            let pageNum = adjustedCurrentPage - 2 + idx;
            if (adjustedCurrentPage <= 2) pageNum = idx + 1;
            else if (adjustedCurrentPage >= totalPages - 1) pageNum = totalPages - 4 + idx;
            pageNum = Math.max(1, Math.min(pageNum, totalPages));

            if (idx > 0 && pageNum === 1) return null; // skip duplicates
            
            return (
              <Button
                key={pageNum}
                variant={adjustedCurrentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={cn(
                  "h-8 w-8 p-0 rounded-lg font-bold text-xs",
                  adjustedCurrentPage === pageNum
                    ? "bg-[#4262ff] hover:bg-[#4262ff]/90 text-white border-[#4262ff]"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, adjustedCurrentPage + 1))}
            disabled={adjustedCurrentPage === totalPages}
            className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ReportDataTable;
