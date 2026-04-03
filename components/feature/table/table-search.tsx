import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search, X, Filter } from "lucide-react";
import { DatePicker, SelectField } from "@/components/ui";
import { useTheme } from "@/context/ThemeContext";

export interface PeriodOption {
  value: string;
  label: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface TableSearchProps {
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Date Range
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  showDateRange?: boolean;

  // Period Filter
  period?: string;
  onPeriodChange?: (period: string) => void;
  periodOptions?: PeriodOption[];
  showPeriod?: boolean;

  // Order By
  orderBy?: string;
  onOrderByChange?: (field: string) => void;
  orderByOptions?: SelectOption[];
  showOrderBy?: boolean;

  // Sort Direction
  sortDirection?: "ASC" | "DESC";
  onSortDirectionChange?: (direction: "ASC" | "DESC") => void;
  showSortDirection?: boolean;

  // Active Filter
  isActive?: boolean | null;
  onIsActiveChange?: (isActive: boolean | null) => void;
  showActiveFilter?: boolean;

  // Role Filter
  role?: string;
  onRoleChange?: (role: string) => void;
  roleOptions?: SelectOption[];
  showRoleFilter?: boolean;

  // Status Filter (Generic)
  status?: string;
  onStatusChange?: (status: string) => void;
  statusOptions?: SelectOption[];
  showStatusFilter?: boolean;

  // Category Filter (Generic)
  category?: string;
  onCategoryChange?: (category: string) => void;
  categoryOptions?: SelectOption[];
  showCategoryFilter?: boolean;

  // Custom Filters (untuk filter tambahan yang fleksibel)
  customFilters?: {
    key: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
  }[];

  // Actions
  onSearch?: () => void;
  onReset?: () => void;

  // Styling
  className?: string;
  layout?: "vertical" | "horizontal";
}

const defaultPeriodOptions: PeriodOption[] = [
  { value: "", label: "Semua Periode" },
  { value: "Today", label: "Hari Ini" },
  { value: "ThisWeek", label: "Minggu Ini" },
  { value: "LastWeek", label: "Minggu Lalu" },
  { value: "ThisMonth", label: "Bulan Ini" },
  { value: "LastMonth", label: "Bulan Lalu" },
  { value: "ThisYear", label: "Tahun Ini" },
  { value: "LastYear", label: "Tahun Lalu" },
  { value: "Last3Months", label: "3 Bulan Terakhir" },
  { value: "Last6Months", label: "6 Bulan Terakhir" },
];

const defaultRoleOptions: SelectOption[] = [
  { value: "", label: "Semua Role" },
  { value: "admin", label: "Admin" },
  { value: "salesman", label: "Salesman" },
  { value: "customer", label: "Customer" },
];

export default function TableSearch({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Cari data...",
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
  showDateRange = false,
  period = "",
  onPeriodChange,
  periodOptions = defaultPeriodOptions,
  showPeriod = false,
  orderBy = "",
  onOrderByChange,
  orderByOptions = [],
  showOrderBy = false,
  sortDirection = "DESC",
  onSortDirectionChange,
  showSortDirection = false,
  isActive,
  onIsActiveChange,
  showActiveFilter = false,
  role = "",
  onRoleChange,
  roleOptions = defaultRoleOptions,
  showRoleFilter = false,
  status = "",
  onStatusChange,
  statusOptions = [],
  showStatusFilter = false,
  category = "",
  onCategoryChange,
  categoryOptions = [],
  showCategoryFilter = false,
  customFilters = [],
  onSearch,
  onReset,
  className,
  layout = "vertical",
}: TableSearchProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [localSearch, setLocalSearch] = useState(searchValue);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleReset = () => {
    setLocalSearch("");
    if (onReset) {
      onReset();
    }
  };

  const hasActiveFilters =
    (showDateRange && (startDate || endDate)) ||
    (showPeriod && period) ||
    (showOrderBy && orderBy) ||
    (showActiveFilter && isActive !== null) ||
    (showRoleFilter && role) ||
    (showStatusFilter && status) ||
    (showCategoryFilter && category) ||
    customFilters.some((filter) => filter.value);

  // Hitung jumlah filter yang aktif
  const activeFilterCount = [
    showDateRange && (startDate || endDate),
    showPeriod && period,
    showRoleFilter && role,
    showStatusFilter && status,
    showCategoryFilter && category,
    showActiveFilter && isActive !== null,
    ...customFilters.map((filter) => filter.value),
  ].filter(Boolean).length;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300",
              isDarkMode ? "text-slate-500" : "text-gray-400"
            )}
          >
            <Search size={20} />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            placeholder={searchPlaceholder}
            className={cn(
              "w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent",
              isDarkMode
                ? "bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                : "bg-white border-slate-300 text-slate-900 placeholder:text-gray-400"
            )}
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-300",
                isDarkMode
                  ? "text-slate-500 hover:text-slate-300"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSearch}
            className="px-6 py-2.5 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 text-white"
          >
            <Search size={18} />
            Cari
          </button>

          {(showDateRange ||
            showPeriod ||
            showOrderBy ||
            showSortDirection ||
            showActiveFilter ||
            showRoleFilter ||
            showStatusFilter ||
            showCategoryFilter ||
            customFilters.length > 0) && (
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200",
                hasActiveFilters
                  ? "bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/30"
                  : isDarkMode
                  ? "bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600/50"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
              )}
            >
              <Filter size={18} />
              Filter
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-white/20 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div
          className={cn(
            "border rounded-2xl p-6 backdrop-blur-sm transition-colors duration-300",
            isDarkMode
              ? "bg-slate-800/50 border-slate-700/50"
              : "bg-slate-50 border-slate-200"
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <h3
              className={cn(
                "text-sm font-bold flex items-center gap-2 transition-colors duration-300",
                isDarkMode ? "text-white" : "text-slate-900"
              )}
            >
              <Filter size={16} className="text-cyan-400" />
              Filter Pencarian
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div
            className={cn(
              "grid gap-4",
              layout === "horizontal"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {/* Period Filter */}
            {showPeriod && (
              <SelectField
                label="Periode"
                value={period}
                onChange={(e) => onPeriodChange?.(e.target.value)}
                options={periodOptions}
                placeholder="Pilih periode"
              />
            )}

            {/* Date Range */}
            {showDateRange && (
              <>
                <DatePicker
                  label="Tanggal Mulai"
                  value={startDate}
                  onChange={(e) => onStartDateChange?.(e.target.value)}
                  showIcon
                />
                <DatePicker
                  label="Tanggal Akhir"
                  value={endDate}
                  onChange={(e) => onEndDateChange?.(e.target.value)}
                  showIcon
                />
              </>
            )}

            {/* Role Filter */}
            {showRoleFilter && (
              <SelectField
                label="Role"
                value={role}
                onChange={(e) => onRoleChange?.(e.target.value)}
                options={roleOptions}
                placeholder="Pilih role"
              />
            )}

            {/* Status Filter */}
            {showStatusFilter && statusOptions.length > 0 && (
              <SelectField
                label="Status"
                value={status}
                onChange={(e) => onStatusChange?.(e.target.value)}
                options={statusOptions}
                placeholder="Pilih status"
              />
            )}

            {/* Category Filter */}
            {showCategoryFilter && categoryOptions.length > 0 && (
              <SelectField
                label="Kategori"
                value={category}
                onChange={(e) => onCategoryChange?.(e.target.value)}
                options={categoryOptions}
                placeholder="Pilih kategori"
              />
            )}

            {/* Active Filter */}
            {showActiveFilter && (
              <SelectField
                label="Status Aktif"
                value={
                  isActive === null ? "" : isActive === true ? "true" : "false"
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    onIsActiveChange?.(null);
                  } else {
                    onIsActiveChange?.(value === "true");
                  }
                }}
                options={[
                  { value: "", label: "Semua Status" },
                  { value: "true", label: "Aktif" },
                  { value: "false", label: "Tidak Aktif" },
                ]}
              />
            )}

            {/* Order By */}
            {showOrderBy && orderByOptions.length > 0 && (
              <SelectField
                label="Urutkan Berdasarkan"
                value={orderBy}
                onChange={(e) => onOrderByChange?.(e.target.value)}
                options={orderByOptions}
                placeholder="Pilih field"
              />
            )}

            {/* Sort Direction */}
            {showSortDirection && (
              <SelectField
                label="Arah Pengurutan"
                value={sortDirection}
                onChange={(e) =>
                  onSortDirectionChange?.(e.target.value as "ASC" | "DESC")
                }
                options={[
                  { value: "ASC", label: "A-Z (Ascending)" },
                  { value: "DESC", label: "Z-A (Descending)" },
                ]}
              />
            )}

            {/* Custom Filters */}
            {customFilters.map((filter) => (
              <SelectField
                key={filter.key}
                label={filter.label}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                options={filter.options}
                placeholder={`Pilih ${filter.label.toLowerCase()}`}
              />
            ))}
          </div>

          {/* Apply Filters Button */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className={cn(
                "px-6 py-2.5 rounded-lg font-semibold transition-all duration-200",
                isDarkMode
                  ? "bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600/50"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
              )}
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="px-6 py-2.5 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 text-white"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
