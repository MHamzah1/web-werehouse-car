/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;

  // Sorting
  orderBy?: string;
  sortDirection?: "ASC" | "DESC";
  onSort?: (field: string) => void;

  // Styling
  className?: string;
  emptyMessage?: string;

  // Row events
  onRowDoubleClick?: (item: T, index: number) => void;

  // Actions
  actions?: (item: T, index: number) => ReactNode;

  // Mobile card view – when provided, renders cards on mobile instead of table
  mobileCardRender?: (item: T, index: number) => ReactNode;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  orderBy,
  sortDirection,
  onSort,
  className,
  emptyMessage = "Tidak ada data tersedia",
  onRowDoubleClick,
  actions,
  mobileCardRender,
}: DataTableProps<T>) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const getSortIcon = (columnKey: string) => {
    if (orderBy !== columnKey) {
      return (
        <ArrowUpDown
          size={16}
          className={isDarkMode ? "text-slate-500" : "text-gray-400"}
        />
      );
    }
    return sortDirection === "ASC" ? (
      <ArrowUp size={16} className="text-cyan-400" />
    ) : (
      <ArrowDown size={16} className="text-cyan-400" />
    );
  };

  const handleSort = (columnKey: string) => {
    if (onSort) {
      onSort(columnKey);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          disabled={loading}
          className={cn(
            "min-w-10 h-10 px-3 text-sm font-medium rounded-lg transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
            i === currentPage
              ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
              : isDarkMode
              ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile Card View */}
      {mobileCardRender && (
        <div className="md:hidden">
          <div
            className={cn(
              "relative rounded-2xl border backdrop-blur-sm overflow-hidden shadow-lg transition-colors duration-300",
              isDarkMode
                ? "bg-slate-800/50 border-slate-700/50"
                : "bg-white border-slate-200"
            )}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  Memuat data...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : data.length === 0 ? (
              <div className="py-12 text-center">
                <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  {emptyMessage}
                </p>
              </div>
            ) : (
              <div className={cn("divide-y", isDarkMode ? "divide-slate-700/50" : "divide-slate-200")}>
                {data.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => onRowDoubleClick?.(item, index)}
                    className={cn(onRowDoubleClick && "cursor-pointer active:bg-slate-700/20")}
                  >
                    {mobileCardRender(item, index)}
                  </div>
                ))}
              </div>
            )}

            {/* Mobile Pagination */}
            {!loading && !error && data.length > 0 && totalPages > 1 && (
              <div
                className={cn(
                  "border-t px-4 py-3 flex items-center justify-between",
                  isDarkMode ? "bg-slate-800/30 border-slate-700/50" : "bg-white border-slate-200"
                )}
              >
                <span className={cn("text-xs", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  {startItem}-{endItem} dari {totalItems}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className={cn(
                      "p-1.5 rounded-lg border disabled:opacity-40",
                      isDarkMode ? "border-slate-600/50 bg-slate-700/50 text-slate-300" : "border-slate-300 bg-white text-slate-700"
                    )}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className={cn("text-sm font-medium px-2", isDarkMode ? "text-slate-300" : "text-slate-700")}>
                    {currentPage}/{totalPages}
                  </span>
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className={cn(
                      "p-1.5 rounded-lg border disabled:opacity-40",
                      isDarkMode ? "border-slate-600/50 bg-slate-700/50 text-slate-300" : "border-slate-300 bg-white text-slate-700"
                    )}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Container (hidden on mobile when mobileCardRender is provided) */}
      <div
        className={cn(
          "relative rounded-2xl border backdrop-blur-sm overflow-hidden shadow-lg transition-colors duration-300",
          isDarkMode
            ? "bg-slate-800/50 border-slate-700/50"
            : "bg-white border-slate-200",
          mobileCardRender && "hidden md:block"
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className={cn(
                "border-b transition-colors duration-300",
                isDarkMode
                  ? "bg-slate-900/50 border-slate-700/50"
                  : "bg-slate-50 border-slate-200"
              )}
            >
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors duration-300",
                      isDarkMode ? "text-slate-400" : "text-slate-600",
                      column.headerClassName
                    )}
                  >
                    {column.sortable && onSort ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        disabled={loading}
                        className={cn(
                          "flex items-center gap-2 transition-colors disabled:cursor-not-allowed",
                          isDarkMode
                            ? "hover:text-cyan-400"
                            : "hover:text-blue-600"
                        )}
                      >
                        {column.header}
                        {getSortIcon(column.key)}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
                {actions && (
                  <th
                    className={cn(
                      "px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors duration-300",
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    )}
                  >
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody
              className={cn(
                "divide-y transition-colors duration-300",
                isDarkMode ? "divide-slate-700/50" : "divide-slate-200"
              )}
            >
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                      <p
                        className={cn(
                          "text-sm transition-colors duration-300",
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        )}
                      >
                        Memuat data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-6 py-12 text-center"
                  >
                    <p
                      className={cn(
                        "text-sm transition-colors duration-300",
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      )}
                    >
                      {emptyMessage}
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((item, rowIndex) => (
                  <tr
                    key={rowIndex}
                    onDoubleClick={() => onRowDoubleClick?.(item, rowIndex)}
                    className={cn(
                      "transition-colors duration-200 group",
                      isDarkMode ? "hover:bg-slate-700/30" : "hover:bg-slate-50",
                      onRowDoubleClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-6 py-4 text-sm transition-colors duration-300",
                          isDarkMode ? "text-slate-300" : "text-slate-900",
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(item, rowIndex)
                          : item[column.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 text-sm">
                        {actions(item, rowIndex)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && data.length > 0 && (
          <div
            className={cn(
              "border-t px-6 py-4 transition-colors duration-300",
              isDarkMode
                ? "bg-slate-800/30 border-slate-700/50"
                : "bg-white border-slate-200"
            )}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Info */}
              <div
                className={cn(
                  "text-sm transition-colors duration-300",
                  isDarkMode ? "text-slate-400" : "text-slate-700"
                )}
              >
                Menampilkan{" "}
                <span
                  className={cn(
                    "font-semibold",
                    isDarkMode ? "text-white" : "text-slate-900"
                  )}
                >
                  {startItem}
                </span>{" "}
                -{" "}
                <span
                  className={cn(
                    "font-semibold",
                    isDarkMode ? "text-white" : "text-slate-900"
                  )}
                >
                  {endItem}
                </span>{" "}
                dari{" "}
                <span
                  className={cn(
                    "font-semibold",
                    isDarkMode ? "text-white" : "text-slate-900"
                  )}
                >
                  {totalItems}
                </span>{" "}
                data
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* First Page */}
                <button
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1 || loading}
                  className={cn(
                    "p-2 rounded-lg border transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isDarkMode
                      ? "border-slate-600/50 bg-slate-700/50 hover:bg-slate-700 text-slate-300"
                      : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                  )}
                  title="Halaman pertama"
                >
                  <ChevronsLeft size={18} />
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className={cn(
                    "p-2 rounded-lg border transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isDarkMode
                      ? "border-slate-600/50 bg-slate-700/50 hover:bg-slate-700 text-slate-300"
                      : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                  )}
                  title="Halaman sebelumnya"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-2">
                  {renderPaginationButtons()}
                </div>

                {/* Mobile: Current Page Info */}
                <div
                  className={cn(
                    "sm:hidden px-4 py-2 text-sm font-medium transition-colors duration-300",
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  )}
                >
                  {currentPage} / {totalPages}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className={cn(
                    "p-2 rounded-lg border transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isDarkMode
                      ? "border-slate-600/50 bg-slate-700/50 hover:bg-slate-700 text-slate-300"
                      : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                  )}
                  title="Halaman selanjutnya"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages || loading}
                  className={cn(
                    "p-2 rounded-lg border transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isDarkMode
                      ? "border-slate-600/50 bg-slate-700/50 hover:bg-slate-700 text-slate-300"
                      : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                  )}
                  title="Halaman terakhir"
                >
                  <ChevronsRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
