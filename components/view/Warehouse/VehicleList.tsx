"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/state/store";
import {
  fetchVehicles,
  fetchVehicleByBarcode,
  clearSuccess,
  clearError,
  VehicleStatus,
  VehicleQueryParams,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiPlus, FiEye } from "react-icons/fi";
import { MdQrCodeScanner } from "react-icons/md";
import { useTheme } from "@/context/ThemeContext";
import { encryptSlug } from "@/lib/slug/slug";
import DataTable, { Column } from "@/components/feature/table/data-table";
import TableSearch from "@/components/feature/table/table-search";
import BarcodeScannerModal from "./BarcodeScannerModal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Vehicle = any;

const statusConfig: Record<string, { label: string; color: string }> = {
  inspecting: {
    label: "Inspeksi",
    color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  },
  registered: {
    label: "Terdaftar",
    color: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  in_warehouse: {
    label: "Di Gudang",
    color: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  in_repair: {
    label: "Perbaikan",
    color: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
  },
  ready: {
    label: "Siap Jual",
    color: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
  },
  listed: {
    label: "Di Marketplace",
    color: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
  sold: {
    label: "Terjual",
    color: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  },
  rejected: {
    label: "Ditolak",
    color: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
  },
};

const statusOptions = [
  { value: "", label: "Semua Status" },
  ...Object.entries(statusConfig).map(([key, { label }]) => ({
    value: key,
    label,
  })),
];

const orderByOptions = [
  { value: "createdAt", label: "Tanggal Dibuat" },
  { value: "brandName", label: "Merek" },
  { value: "year", label: "Tahun" },
  { value: "askingPrice", label: "Harga" },
  { value: "status", label: "Status" },
];

const VehicleList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { vehicles, selectedShowroom, loading, error, successMessage, pagination } =
    useSelector((state: RootState) => state.warehouse);

  const [scannerOpen, setScannerOpen] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [periode, setPeriode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const buildParams = useCallback((): VehicleQueryParams => {
    return {
      showroomId: selectedShowroom?.id,
      page: currentPage,
      perPage,
      ...(search ? { search } : {}),
      ...(statusFilter ? { status: statusFilter as VehicleStatus } : {}),
      ...(periode ? { periode } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(orderBy ? { orderBy } : {}),
      sortDirection,
    };
  }, [
    selectedShowroom,
    currentPage,
    search,
    statusFilter,
    periode,
    startDate,
    endDate,
    orderBy,
    sortDirection,
  ]);

  useEffect(() => {
    dispatch(fetchVehicles(buildParams()));
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
    dispatch(fetchVehicles({ ...buildParams(), page: 1 }));
  };

  const handleReset = () => {
    setSearch("");
    setStatusFilter("");
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

  const handleScanSuccess = async (barcode: string) => {
    setScannerOpen(false);
    const result = await dispatch(fetchVehicleByBarcode(barcode));
    if (fetchVehicleByBarcode.fulfilled.match(result)) {
      const vehicle = result.payload;
      router.push(`/warehouse/vehicles/${encryptSlug(vehicle.id)}`);
    } else {
      toast.error(`Kendaraan dengan barcode "${barcode}" tidak ditemukan.`);
    }
  };

  const handleRowDoubleClick = (vehicle: Vehicle) => {
    router.push(`/warehouse/vehicles/${encryptSlug(vehicle.id)}`);
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const columns: Column<Vehicle>[] = [
    {
      key: "barcode",
      header: "Barcode",
      sortable: false,
      render: (v) => (
        <span className="font-mono text-emerald-500 dark:text-emerald-400 text-xs">
          {v.barcode}
        </span>
      ),
    },
    {
      key: "brandName",
      header: "Kendaraan",
      sortable: true,
      render: (v) => (
        <div>
          <div
            className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {v.brandName} {v.modelName}
          </div>
          <div
            className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {v.year} &bull; {v.color} &bull; {v.transmission}
          </div>
        </div>
      ),
    },
    {
      key: "licensePlate",
      header: "Nopol",
      sortable: false,
      className: "hidden sm:table-cell",
      headerClassName: "hidden sm:table-cell",
    },
    {
      key: "askingPrice",
      header: "Harga",
      sortable: true,
      className: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      render: (v) => (
        <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
          {formatPrice(v.askingPrice)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (v) => {
        const sc = statusConfig[v.status] || {
          label: v.status,
          color: "bg-slate-500/20 text-slate-500 dark:text-slate-400",
        };
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${sc.color}`}
          >
            {sc.label}
          </span>
        );
      },
    },
    {
      key: "sellerName",
      header: "Penjual",
      sortable: false,
      className: "hidden lg:table-cell text-xs",
      headerClassName: "hidden lg:table-cell",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Kendaraan Warehouse
          </h1>
          <p
            className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {selectedShowroom
              ? `Showroom: ${selectedShowroom.name}`
              : "Semua kendaraan"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl text-sm font-medium transition-colors"
          >
            <MdQrCodeScanner className="text-lg" /> Scan QR
          </button>
          <Link
            href="/warehouse/vehicles/register"
            className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-emerald-500/30 transition-all"
          >
            <FiPlus /> Register
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <TableSearch
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari barcode, brand, model, nopol..."
        showPeriod
        period={periode}
        onPeriodChange={(v) => {
          setPeriode(v);
          if (v) {
            setStartDate("");
            setEndDate("");
          }
        }}
        showDateRange
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(v) => {
          setStartDate(v);
          if (v) setPeriode("");
        }}
        onEndDateChange={(v) => {
          setEndDate(v);
          if (v) setPeriode("");
        }}
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
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Data Table */}
      <DataTable<Vehicle>
        data={vehicles}
        columns={columns}
        loading={loading}
        error={error}
        currentPage={pagination.page || currentPage}
        totalPages={pagination.totalPages || 1}
        totalItems={pagination.total || vehicles.length}
        pageSize={perPage}
        onPageChange={handlePageChange}
        orderBy={orderBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowDoubleClick={handleRowDoubleClick}
        emptyMessage="Belum ada kendaraan terdaftar"
        actions={(v) => (
          <Link
            href={`/warehouse/vehicles/${encryptSlug(v.id)}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-xs font-medium transition-colors"
          >
            <FiEye /> Detail
          </Link>
        )}
        mobileCardRender={(v) => {
          const sc = statusConfig[v.status] || {
            label: v.status,
            color: "bg-slate-500/20 text-slate-500",
          };
          return (
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                    {v.brandName} {v.modelName}
                  </p>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {v.year} &bull; {v.color} &bull; {v.transmission}
                  </p>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${sc.color}`}>
                  {sc.label}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-emerald-500 dark:text-emerald-400 text-xs">
                    {v.barcode}
                  </span>
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {v.licensePlate}
                  </span>
                </div>
                <Link
                  href={`/warehouse/vehicles/${encryptSlug(v.id)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-xs font-medium"
                >
                  <FiEye size={12} /> Detail
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {formatPrice(v.askingPrice)}
                </span>
                {v.sellerName && (
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {v.sellerName}
                  </span>
                )}
              </div>
            </div>
          );
        }}
      />

      {/* QR Code Scanner Modal */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};

export default VehicleList;
