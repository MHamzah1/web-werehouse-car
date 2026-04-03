"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/state/store";
import {
  fetchRepairs,
  clearSuccess,
  clearError,
  RepairQueryParams,
  RepairStatus,
  RepairType,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiPlus, FiEye } from "react-icons/fi";
import { useTheme } from "@/context/ThemeContext";
import { encryptSlug, generateUrlWithEncryptedParams } from "@/lib/slug/slug";
import DataTable, { Column } from "@/components/feature/table/data-table";
import TableSearch from "@/components/feature/table/table-search";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Repair = any;

const repairStatusConfig: Record<string, { label: string; color: string }> = {
  pending: {
    label: "Menunggu",
    color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  },
  in_progress: {
    label: "Dikerjakan",
    color: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  completed: {
    label: "Selesai",
    color: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  cancelled: {
    label: "Dibatalkan",
    color: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
  },
};

const repairTypeConfig: Record<string, { label: string; color: string }> = {
  light: {
    label: "Ringan",
    color: "bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30",
  },
  heavy: {
    label: "Berat",
    color: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
  },
};

const statusOptions = [
  { value: "", label: "Semua Status" },
  ...Object.entries(repairStatusConfig).map(([key, { label }]) => ({
    value: key,
    label,
  })),
];

const orderByOptions = [
  { value: "createdAt", label: "Tanggal Dibuat" },
  { value: "repairType", label: "Jenis Perbaikan" },
  { value: "status", label: "Status" },
  { value: "estimatedCost", label: "Estimasi Biaya" },
];

const RepairList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { repairs, selectedShowroom, loading, error, successMessage, repairPagination } =
    useSelector((state: RootState) => state.warehouse);

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [repairTypeFilter, setRepairTypeFilter] = useState("");
  const [periode, setPeriode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const buildParams = useCallback((): RepairQueryParams => {
    return {
      showroomId: selectedShowroom?.id,
      page: currentPage,
      perPage,
      ...(search ? { search } : {}),
      ...(statusFilter ? { status: statusFilter as RepairStatus } : {}),
      ...(repairTypeFilter ? { repairType: repairTypeFilter as RepairType } : {}),
      ...(periode ? { periode } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(orderBy ? { orderBy } : {}),
      sortDirection,
    };
  }, [selectedShowroom, currentPage, search, statusFilter, repairTypeFilter, periode, startDate, endDate, orderBy, sortDirection]);

  useEffect(() => {
    dispatch(fetchRepairs(buildParams()));
  }, [dispatch, buildParams]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccess());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch]);

  const handleSearch = () => {
    setCurrentPage(1);
    dispatch(fetchRepairs({ ...buildParams(), page: 1 }));
  };

  const handleReset = () => {
    setSearch("");
    setStatusFilter("");
    setRepairTypeFilter("");
    setPeriode("");
    setStartDate("");
    setEndDate("");
    setOrderBy("createdAt");
    setSortDirection("DESC");
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (orderBy === field) {
      setSortDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setOrderBy(field);
      setSortDirection("ASC");
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowDoubleClick = (repair: Repair) => {
    router.push(generateUrlWithEncryptedParams("/warehouse/repairs/detail", { id: repair.id }));
  };

  const formatPrice = (n: number) =>
    n
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(n)
      : "-";

  const formatDate = (d: string) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const columns: Column<Repair>[] = [
    {
      key: "warehouseVehicle",
      header: "Kendaraan",
      sortable: false,
      render: (r) => {
        const v = r.warehouseVehicle;
        if (!v) return <span className="text-slate-400">-</span>;
        return (
          <div>
            <div className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {v.brandName} {v.modelName}
            </div>
            <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <span className="font-mono text-emerald-500 dark:text-emerald-400">
                {v.barcode}
              </span>
              {" "}&bull;{" "}{v.year}
            </div>
          </div>
        );
      },
    },
    {
      key: "repairType",
      header: "Jenis",
      sortable: true,
      render: (r) => {
        const tc = repairTypeConfig[r.repairType] || {
          label: r.repairType,
          color: "bg-slate-500/20 text-slate-400",
        };
        return (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${tc.color}`}>
            {tc.label}
          </span>
        );
      },
    },
    {
      key: "description",
      header: "Deskripsi",
      sortable: false,
      className: "hidden md:table-cell max-w-[200px]",
      headerClassName: "hidden md:table-cell",
      render: (r) => (
        <span className={`text-sm truncate block ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          {r.description}
        </span>
      ),
    },
    {
      key: "estimatedCost",
      header: "Estimasi Biaya",
      sortable: true,
      className: "hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      render: (r) => (
        <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
          {formatPrice(r.estimatedCost)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (r) => {
        const sc = repairStatusConfig[r.status] || {
          label: r.status,
          color: "bg-slate-500/20 text-slate-400",
        };
        return (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${sc.color}`}>
            {sc.label}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Tanggal",
      sortable: true,
      className: "hidden sm:table-cell",
      headerClassName: "hidden sm:table-cell",
      render: (r) => (
        <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {formatDate(r.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Repair Orders
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {selectedShowroom
              ? `Showroom: ${selectedShowroom.name}`
              : "Kelola perbaikan kendaraan"}
          </p>
        </div>
        <Link
          href="/warehouse/repairs/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-emerald-500/30 transition-all"
        >
          <FiPlus /> Buat Repair Order
        </Link>
      </div>

      {/* Search & Filters */}
      <TableSearch
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari barcode, brand, model, deskripsi..."
        showPeriod
        period={periode}
        onPeriodChange={(v) => {
          setPeriode(v);
          if (v) { setStartDate(""); setEndDate(""); }
        }}
        showDateRange
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(v) => { setStartDate(v); if (v) setPeriode(""); }}
        onEndDateChange={(v) => { setEndDate(v); if (v) setPeriode(""); }}
        showStatusFilter
        status={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={statusOptions}
        showOrderBy
        orderBy={orderBy}
        onOrderByChange={setOrderBy}
        orderByOptions={orderByOptions}
        showSortDirection
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
        customFilters={[
          {
            key: "repairType",
            label: "Jenis Perbaikan",
            value: repairTypeFilter,
            onChange: setRepairTypeFilter,
            options: [
              { value: "", label: "Semua Jenis" },
              { value: "light", label: "Ringan" },
              { value: "heavy", label: "Berat" },
            ],
          },
        ]}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Data Table */}
      <DataTable<Repair>
        data={repairs}
        columns={columns}
        loading={loading}
        error={error}
        currentPage={repairPagination.page || currentPage}
        totalPages={repairPagination.totalPages || 1}
        totalItems={repairPagination.total || repairs.length}
        pageSize={perPage}
        onPageChange={handlePageChange}
        orderBy={orderBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowDoubleClick={handleRowDoubleClick}
        emptyMessage="Belum ada repair order"
        actions={(r) => (
          <Link
            href={generateUrlWithEncryptedParams("/warehouse/repairs/detail", { id: r.id })}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-medium transition-colors"
          >
            <FiEye /> Detail
          </Link>
        )}
        mobileCardRender={(r) => {
          const v = r.warehouseVehicle;
          const sc = repairStatusConfig[r.status] || {
            label: r.status,
            color: "bg-slate-500/20 text-slate-400",
          };
          const tc = repairTypeConfig[r.repairType] || {
            label: r.repairType,
            color: "bg-slate-500/20 text-slate-400",
          };
          return (
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {v ? (
                    <>
                      <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                        {v.brandName} {v.modelName}
                      </p>
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        <span className="font-mono text-emerald-500 dark:text-emerald-400">{v.barcode}</span>
                        {" "}&bull; {v.year}
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-400 text-sm">-</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${tc.color}`}>
                    {tc.label}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${sc.color}`}>
                    {sc.label}
                  </span>
                </div>
              </div>
              {r.description && (
                <p className={`text-xs line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {r.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                    {formatPrice(r.estimatedCost)}
                  </span>
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {formatDate(r.createdAt)}
                  </span>
                </div>
                <Link
                  href={generateUrlWithEncryptedParams("/warehouse/repairs/detail", { id: r.id })}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-xs font-medium"
                >
                  <FiEye size={12} /> Detail
                </Link>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default RepairList;
