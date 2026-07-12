import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import type { ColumnDef, HeaderGroup, Row, Cell, Header } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Eye, BookOpen, MapPin, Package } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { ConditionBadge, StatusBadge } from "./AssetConditionBadge";
import type { Asset } from "../types";

const colHelper = createColumnHelper<Asset>();

interface Props {
  data: Asset[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
}

export const AssetTable: React.FC<Props> = ({ data, isLoading, page, totalPages, onPageChange, total }) => {
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<Asset, any>[] = useMemo(
    () => [
      colHelper.accessor("photoUrl", {
        header: "Photo",
        size: 64,
        cell: ({ getValue, row }) => {
          const url = getValue() as string | null;
          return url ? (
            <img
              src={url}
              alt={(row as Row<Asset>).original.name}
              className="h-9 w-9 rounded-lg object-cover border border-slate-200"
            />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Package className="h-4 w-4 text-slate-400" />
            </div>
          );
        },
      }),
      colHelper.accessor("assetTag", {
        header: "Asset Tag",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs font-semibold text-[#4262ff] bg-[#4262ff]/10 px-2 py-0.5 rounded-md">
            {getValue() as string}
          </span>
        ),
      }),
      colHelper.accessor("name", {
        header: "Asset Name",
        cell: ({ getValue }) => <span className="font-medium text-ink text-sm">{getValue() as string}</span>,
      }),
      colHelper.accessor("category", {
        header: "Category",
        cell: ({ getValue }) => {
          const v = getValue() as Asset["category"];
          return <span className="text-sm text-ink-subtle">{v?.name ?? "—"}</span>;
        },
      }),
      colHelper.accessor("department", {
        header: "Department",
        cell: ({ getValue }) => {
          const v = getValue() as Asset["department"];
          return <span className="text-sm text-ink-subtle">{v?.name ?? "—"}</span>;
        },
      }),
      colHelper.accessor("serialNumber", {
        header: "Serial No.",
        cell: ({ getValue }) => (
          <span className="text-xs font-mono text-slate-500">{(getValue() as string | null) ?? "—"}</span>
        ),
      }),
      colHelper.accessor("condition", {
        header: "Condition",
        cell: ({ getValue }) => <ConditionBadge condition={getValue()} />,
      }),
      colHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      }),
      colHelper.accessor("currentLocation", {
        header: "Location",
        cell: ({ getValue }) => {
          const loc = getValue() as string | null;
          return loc ? (
            <span className="flex items-center gap-1 text-xs text-slate-600">
              <MapPin className="h-3 w-3 text-slate-400" />
              {loc}
            </span>
          ) : <span className="text-slate-400 text-xs">—</span>;
        },
      }),
      colHelper.accessor("isBookable", {
        header: "Bookable",
        cell: ({ getValue }) =>
          (getValue() as boolean) ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <BookOpen className="h-3.5 w-3.5" /> Yes
            </span>
          ) : (
            <span className="text-xs text-slate-400">No</span>
          ),
      }),
      colHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/assets/${(row as Row<Asset>).original.id}`)}
            className="h-8 w-8 p-0 rounded-full hover:bg-[#4262ff]/10"
            title="View details"
          >
            <Eye className="h-4 w-4 text-slate-500" />
          </Button>
        ),
      }),
    ],
    [navigate]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-base font-semibold text-ink">No assets found</p>
        <p className="text-sm text-ink-subtle mt-1">Try adjusting your filters or register a new asset.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg: HeaderGroup<Asset>) => (
                <tr key={hg.id} className="border-b border-slate-100 bg-slate-50/80">
                  {hg.headers.map((header: Header<Asset, unknown>) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row: Row<Asset>) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                >
                  {row.getVisibleCells().map((cell: Cell<Asset, unknown>) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-subtle">
            Page {page} of {totalPages} · {total} total assets
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
