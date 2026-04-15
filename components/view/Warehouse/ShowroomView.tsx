"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/state/store";
import {
  fetchShowroomView,
  fetchShowroomViewVehicle,
  markVehicleReadyAndPlace,
  clearSuccess,
  clearError,
  clearShowroomViewVehicle,
  ShowroomViewVehicle,
  ShowroomViewVehicleDetail,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { encryptSlug, generateUrlWithEncryptedParams } from "@/lib/slug/slug";
import Link from "next/link";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiTool,
  FiClipboard,
  FiDollarSign,
  FiCheck,
  FiGrid,
  FiList,
  FiBarChart2,
  FiTag,
  FiRefreshCw,
  FiImage,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { BsSpeedometer2, BsFuelPump, BsBuilding } from "react-icons/bs";
import { TbManualGearbox } from "react-icons/tb";

// ============================
// STATUS CONFIG
// ============================
const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  inspecting: {
    label: "Inspeksi",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    dot: "bg-yellow-500",
  },
  registered: {
    label: "Terdaftar",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    dot: "bg-blue-500",
  },
  in_warehouse: {
    label: "Di Gudang",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  in_repair: {
    label: "Perbaikan",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
    dot: "bg-orange-500",
  },
  ready: {
    label: "Siap Jual",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    dot: "bg-green-500",
  },
  listed: {
    label: "Di Marketplace",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
    dot: "bg-purple-500",
  },
  sold: {
    label: "Terjual",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/30",
    dot: "bg-cyan-500",
  },
  rejected: {
    label: "Ditolak",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    dot: "bg-red-500",
  },
};

const zoneTypeLabels: Record<string, string> = {
  ready: "Ready",
  light_repair: "Repair Ringan",
  heavy_repair: "Repair Berat",
  holding: "Holding",
  showroom_display: "Display Showroom",
};

// ============================
// HELPER FUNCTIONS
// ============================
const formatPrice = (n: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(n));

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatDateTime = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatMileage = (m: number) =>
  new Intl.NumberFormat("id-ID").format(m) + " km";

// ============================
// MAIN COMPONENT
// ============================
const ShowroomView = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    selectedShowroom,
    showroomView,
    showroomViewVehicleDetail,
    showroomViewLoading,
    actionLoading,
    error,
    successMessage,
    pagination,
  } = useSelector((state: RootState) => state.warehouse);

  // Local state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [zoneTypeFilter, setZoneTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("DESC");
  const [page, setPage] = useState(1);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL_IMAGES ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
    "http://localhost:8081";

  // Fetch data
  const loadData = useCallback(() => {
    if (!selectedShowroom?.id) return;
    dispatch(
      fetchShowroomView({
        showroomId: selectedShowroom.id,
        params: {
          page,
          perPage: 20,
          ...(search ? { search } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(zoneTypeFilter ? { zoneType: zoneTypeFilter } : {}),
          sortBy,
          sortDirection,
        },
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    selectedShowroom,
    page,
    search,
    statusFilter,
    zoneTypeFilter,
    sortBy,
    sortDirection,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccess());
      loadData();
      if (selectedVehicleId) {
        dispatch(fetchShowroomViewVehicle(selectedVehicleId));
      }
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, loadData, selectedVehicleId]);

  // Open vehicle detail
  const openVehicleDetail = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setImageIndex(0);
    dispatch(fetchShowroomViewVehicle(vehicleId));
  };

  const closeVehicleDetail = () => {
    setSelectedVehicleId(null);
    dispatch(clearShowroomViewVehicle());
  };

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const vehicles = showroomView?.vehicles || [];
  const statusCounts = showroomView?.statusCounts || {};
  const zones = showroomView?.zones || [];
  const showroom = showroomView?.showroom;

  if (!selectedShowroom) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <BsBuilding className="text-6xl text-slate-400" />
        <p
          className={`text-lg font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          Pilih showroom terlebih dahulu dari sidebar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* ============ HEADER ============ */}
      <div
        className={`rounded-2xl border overflow-hidden ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"}`}
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BsBuilding className="text-white/80" />
                <span className="text-white/70 text-sm font-medium">
                  {showroom?.code || selectedShowroom.code}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                {showroom?.name || selectedShowroom.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <FiMapPin className="text-white/60 text-sm" />
                <span className="text-white/70 text-sm">
                  {showroom?.city || selectedShowroom.city},{" "}
                  {showroom?.province || selectedShowroom.province}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-sm transition-colors backdrop-blur-sm"
              >
                <FiRefreshCw
                  className={showroomViewLoading ? "animate-spin" : ""}
                />{" "}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Status Counts Bar */}
        <div
          className={`px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap gap-2 sm:gap-3 ${isDark ? "bg-slate-800/30" : "bg-slate-50"}`}
        >
          <button
            onClick={() => {
              setStatusFilter("");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              statusFilter === ""
                ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25"
                : isDark
                  ? "bg-slate-700/50 text-slate-400 border-slate-600 hover:border-slate-500"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            }`}
          >
            Semua ({Object.values(statusCounts).reduce((a, b) => a + b, 0)})
          </button>
          {Object.entries(statusCounts)
            .filter(([, count]) => count > 0)
            .map(([status, count]) => {
              const sc = statusConfig[status];
              if (!sc) return null;
              return (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(statusFilter === status ? "" : status);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    statusFilter === status
                      ? `${sc.bg} ${sc.color} border-current shadow-md`
                      : isDark
                        ? "bg-slate-700/50 text-slate-400 border-slate-600 hover:border-slate-500"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                  {sc.label} ({count})
                </button>
              );
            })}
        </div>
      </div>

      {/* ============ ZONES SUMMARY ============ */}
      {zones.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {zones.map((zone) => {
            const pct =
              zone.capacity > 0
                ? Math.round((zone.currentCount / zone.capacity) * 100)
                : 0;
            const isFull = pct >= 80;
            return (
              <div
                key={zone.id}
                className={`rounded-xl border p-4 transition-all hover:shadow-md ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      zone.type === "ready"
                        ? "bg-green-500/15 text-green-600 dark:text-green-400"
                        : zone.type === "showroom_display"
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                          : "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                    }`}
                  >
                    {zoneTypeLabels[zone.type] || zone.type}
                  </span>
                  <span
                    className={`text-xs font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {zone.code}
                  </span>
                </div>
                <p
                  className={`text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-800"}`}
                >
                  {zone.name}
                </p>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isFull ? "bg-red-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p
                  className={`text-xs mt-1 ${isFull ? "text-red-500 font-bold" : isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  {zone.currentCount}/{zone.capacity} ({pct}%)
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* ============ SEARCH & FILTER BAR ============ */}
      <div
        className={`rounded-2xl border p-4 ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"}`}
      >
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari brand, model, plat, barcode..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-colors border ${
                isDark
                  ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500"
              } outline-none`}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FiX />
              </button>
            )}
          </div>

          {/* View Mode */}
          <div
            className={`flex rounded-xl border overflow-hidden ${isDark ? "border-slate-600" : "border-slate-200"}`}
          >
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2.5 transition-colors ${viewMode === "grid" ? "bg-emerald-500 text-white" : isDark ? "bg-slate-700/50 text-slate-400 hover:text-white" : "bg-white text-slate-500 hover:text-slate-700"}`}
            >
              <FiGrid />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2.5 transition-colors ${viewMode === "list" ? "bg-emerald-500 text-white" : isDark ? "bg-slate-700/50 text-slate-400 hover:text-white" : "bg-white text-slate-500 hover:text-slate-700"}`}
            >
              <FiList />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              showFilters
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : isDark
                  ? "bg-slate-700/50 border-slate-600 text-slate-400 hover:text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-700"
            }`}
          >
            <FiFilter />
            Filter
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div
            className={`mt-3 pt-3 border-t grid grid-cols-1 md:grid-cols-3 gap-3 ${isDark ? "border-slate-700" : "border-slate-200"}`}
          >
            {/* Zone Type Filter */}
            <div>
              <label
                className={`text-xs font-semibold mb-1 block ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Tipe Zona
              </label>
              <select
                value={zoneTypeFilter}
                onChange={(e) => {
                  setZoneTypeFilter(e.target.value);
                  setPage(1);
                }}
                className={`w-full px-3 py-2 rounded-lg text-sm border outline-none ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                <option value="">Semua Zona</option>
                <option value="ready">Ready</option>
                <option value="light_repair">Repair Ringan</option>
                <option value="heavy_repair">Repair Berat</option>
                <option value="holding">Holding</option>
                <option value="showroom_display">Display Showroom</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label
                className={`text-xs font-semibold mb-1 block ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Urutkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm border outline-none ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                <option value="createdAt">Tanggal Masuk</option>
                <option value="askingPrice">Harga</option>
                <option value="brandName">Brand</option>
                <option value="year">Tahun</option>
                <option value="mileage">Kilometer</option>
              </select>
            </div>

            {/* Sort Direction */}
            <div>
              <label
                className={`text-xs font-semibold mb-1 block ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Arah Urutan
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortDirection("DESC")}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    sortDirection === "DESC"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : isDark
                        ? "bg-slate-700/50 border-slate-600 text-slate-400"
                        : "bg-white border-slate-200 text-slate-500"
                  }`}
                >
                  <FiArrowDown /> Terbaru
                </button>
                <button
                  onClick={() => setSortDirection("ASC")}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    sortDirection === "ASC"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : isDark
                        ? "bg-slate-700/50 border-slate-600 text-slate-400"
                        : "bg-white border-slate-200 text-slate-500"
                  }`}
                >
                  <FiArrowUp /> Terlama
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ LOADING STATE ============ */}
      {showroomViewLoading && vehicles.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
        </div>
      )}

      {/* ============ EMPTY STATE ============ */}
      {!showroomViewLoading && vehicles.length === 0 && (
        <div
          className={`rounded-2xl border p-12 text-center ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"}`}
        >
          <FiSearch className="text-5xl mx-auto mb-4 text-slate-400" />
          <p
            className={`text-lg font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            Tidak ada kendaraan ditemukan
          </p>
          <p
            className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            Coba ubah filter atau kata kunci pencarian
          </p>
        </div>
      )}

      {/* ============ VEHICLE GRID ============ */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              isDark={isDark}
              baseUrl={baseUrl}
              onClick={() => openVehicleDetail(v.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((v) => (
            <VehicleListItem
              key={v.id}
              vehicle={v}
              isDark={isDark}
              baseUrl={baseUrl}
              onClick={() => openVehicleDetail(v.id)}
            />
          ))}
        </div>
      )}

      {/* ============ PAGINATION ============ */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className={`p-2.5 rounded-xl border transition-colors disabled:opacity-40 ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-800"
            }`}
          >
            <FiChevronLeft />
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                  p === page
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : isDark
                      ? "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                      : "bg-white text-slate-600 hover:text-slate-800 border border-slate-200"
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page >= pagination.totalPages}
            className={`p-2.5 rounded-xl border transition-colors disabled:opacity-40 ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-800"
            }`}
          >
            <FiChevronRight />
          </button>
        </div>
      )}

      {/* ============ VEHICLE DETAIL MODAL ============ */}
      {selectedVehicleId && (
        <VehicleDetailModal
          detail={showroomViewVehicleDetail}
          loading={showroomViewLoading}
          actionLoading={actionLoading}
          isDark={isDark}
          baseUrl={baseUrl}
          imageIndex={imageIndex}
          setImageIndex={setImageIndex}
          zones={zones}
          onClose={closeVehicleDetail}
          dispatch={dispatch}
        />
      )}
    </div>
  );
};

// ============================
// VEHICLE CARD (Grid View)
// ============================
const VehicleCard = ({
  vehicle: v,
  isDark,
  baseUrl,
  onClick,
}: {
  vehicle: ShowroomViewVehicle;
  isDark: boolean;
  baseUrl: string;
  onClick: () => void;
}) => {
  const sc = statusConfig[v.status] || {
    label: v.status,
    color: "text-slate-500",
    bg: "bg-slate-100 border-slate-300",
    dot: "bg-slate-400",
  };
  const imgUrl = v.thumbnail
    ? v.thumbnail.startsWith("http")
      ? v.thumbnail
      : baseUrl + v.thumbnail
    : null;

  return (
    <div
      onClick={onClick}
      className={`group rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isDark
          ? "bg-slate-800/60 border-slate-700/50 hover:border-emerald-500/40"
          : "bg-white border-slate-200 hover:border-emerald-500/50"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={`${v.brandName} ${v.modelName}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiImage className="text-4xl text-slate-400" />
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-sm ${sc.bg} ${sc.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {sc.label}
          </span>
        </div>
        {/* Price Tag */}
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-sm font-bold">
            {formatPrice(v.askingPrice)}
          </span>
        </div>
        {/* Inspection Badge */}
        {v.latestInspection && (
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm ${
                v.latestInspection.result === "accepted_ready"
                  ? "bg-green-500/90 text-white"
                  : v.latestInspection.result === "accepted_repair"
                    ? "bg-orange-500/90 text-white"
                    : "bg-red-500/90 text-white"
              }`}
            >
              {v.latestInspection.result === "accepted_ready"
                ? "✓ Lolos"
                : v.latestInspection.result === "accepted_repair"
                  ? "⚠ Perlu Repair"
                  : "✗ Ditolak"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <div className="mb-2">
          <h3
            className={`font-bold text-base leading-tight ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {v.brandName} {v.modelName}
          </h3>
          <p
            className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {v.year} • {v.color} •{" "}
            {v.transmission === "matic" ? "Matic" : "Manual"}
          </p>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`flex items-center gap-1 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            <BsSpeedometer2 className="text-sm" /> {formatMileage(v.mileage)}
          </span>
          <span
            className={`flex items-center gap-1 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            <BsFuelPump className="text-sm" /> {v.fuelType}
          </span>
        </div>

        {/* Plate */}
        <div
          className={`flex items-center justify-between pt-3 border-t ${isDark ? "border-slate-700/50" : "border-slate-100"}`}
        >
          <span
            className={`font-mono text-xs px-2 py-1 rounded-md border ${isDark ? "bg-slate-700/50 border-slate-600 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}
          >
            {v.licensePlate}
          </span>
          {v.currentZone && (
            <span
              className={`text-xs font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
            >
              📍 {v.currentZone.name}
            </span>
          )}
        </div>

        {/* Barcode */}
        <div className={`mt-2 flex items-center justify-between`}>
          <span
            className={`text-[10px] font-mono ${isDark ? "text-slate-600" : "text-slate-300"}`}
          >
            {v.barcode}
          </span>
          <span
            className={`text-[10px] ${isDark ? "text-slate-600" : "text-slate-300"}`}
          >
            {formatDate(v.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================
// VEHICLE LIST ITEM
// ============================
const VehicleListItem = ({
  vehicle: v,
  isDark,
  baseUrl,
  onClick,
}: {
  vehicle: ShowroomViewVehicle;
  isDark: boolean;
  baseUrl: string;
  onClick: () => void;
}) => {
  const sc = statusConfig[v.status] || {
    label: v.status,
    color: "text-slate-500",
    bg: "bg-slate-100 border-slate-300",
    dot: "bg-slate-400",
  };
  const imgUrl = v.thumbnail
    ? v.thumbnail.startsWith("http")
      ? v.thumbnail
      : baseUrl + v.thumbnail
    : null;

  return (
    <div
      onClick={onClick}
      className={`group flex gap-3 sm:gap-4 rounded-xl border p-3 cursor-pointer transition-all hover:shadow-md ${
        isDark
          ? "bg-slate-800/60 border-slate-700/50 hover:border-emerald-500/40"
          : "bg-white border-slate-200 hover:border-emerald-500/50"
      }`}
    >
      {/* Thumbnail */}
      <div className="w-20 h-16 sm:w-28 sm:h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={v.brandName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiImage className="text-xl text-slate-400" />
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {v.brandName} {v.modelName} {v.year}
            </h3>
            <p
              className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {v.licensePlate} • {v.color} •{" "}
              {v.transmission === "matic" ? "Matic" : "Manual"}
            </p>
          </div>
          <span
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold border whitespace-nowrap ${sc.bg} ${sc.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {sc.label}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              <BsSpeedometer2 className="inline mr-1" />
              {formatMileage(v.mileage)}
            </span>
            <span
              className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              <BsFuelPump className="inline mr-1" />
              {v.fuelType}
            </span>
            <span
              className={`font-mono text-[10px] ${isDark ? "text-slate-600" : "text-slate-300"}`}
            >
              {v.barcode}
            </span>
          </div>
          <span
            className={`text-sm font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
          >
            {formatPrice(v.askingPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================
// VEHICLE DETAIL MODAL
// ============================
const VehicleDetailModal = ({
  detail,
  loading,
  actionLoading,
  isDark,
  baseUrl,
  imageIndex,
  setImageIndex,
  zones,
  onClose,
  dispatch,
}: {
  detail: ShowroomViewVehicleDetail | null;
  loading: boolean;
  actionLoading: boolean;
  isDark: boolean;
  baseUrl: string;
  imageIndex: number;
  setImageIndex: (i: number) => void;
  zones: Array<{
    id: string;
    code: string;
    name: string;
    type: string;
    capacity: number;
    currentCount: number;
  }>;
  onClose: () => void;
  dispatch: AppDispatch;
}) => {
  const [activeTab, setActiveTab] = useState<
    "info" | "inspection" | "repair" | "history"
  >("info");
  const getImageUrl = (url: string) =>
    url?.startsWith("http") ? url : baseUrl + url;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-5xl max-h-[95vh] sm:max-h-[92vh] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col ${
          isDark
            ? "bg-slate-900 border border-slate-700"
            : "bg-white border border-slate-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isDark
              ? "bg-slate-800 hover:bg-slate-700 text-slate-400"
              : "bg-slate-100 hover:bg-slate-200 text-slate-500"
          }`}
        >
          <FiX className="text-xl" />
        </button>

        {/* Loading */}
        {loading && !detail && (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
          </div>
        )}

        {detail && (
          <div className="overflow-y-auto flex-1">
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image Gallery */}
              <div className="relative bg-slate-100 dark:bg-slate-950">
                {detail.vehicle.images && detail.vehicle.images.length > 0 ? (
                  <>
                    <div className="aspect-[16/11] overflow-hidden">
                      <img
                        src={getImageUrl(detail.vehicle.images[imageIndex])}
                        alt={`${detail.vehicle.brandName} ${detail.vehicle.modelName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Thumbnail Strip */}
                    {detail.vehicle.images.length > 1 && (
                      <div className="flex gap-2 p-3 overflow-x-auto">
                        {detail.vehicle.images.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setImageIndex(i)}
                            className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                              i === imageIndex
                                ? "border-emerald-500 shadow-lg"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={getImageUrl(img)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Arrows */}
                    {detail.vehicle.images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setImageIndex(
                              imageIndex > 0
                                ? imageIndex - 1
                                : detail.vehicle.images!.length - 1,
                            )
                          }
                          className="absolute left-3 top-1/3 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <FiChevronLeft />
                        </button>
                        <button
                          onClick={() =>
                            setImageIndex(
                              imageIndex < detail.vehicle.images!.length - 1
                                ? imageIndex + 1
                                : 0,
                            )
                          }
                          className="absolute right-3 top-1/3 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <FiChevronRight />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="aspect-[16/11] flex items-center justify-center">
                    <FiImage className="text-6xl text-slate-400" />
                  </div>
                )}
              </div>

              {/* Vehicle Info */}
              <div className="p-4 sm:p-6 flex flex-col">
                {/* Status & Barcode */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {(() => {
                    const sc = statusConfig[detail.vehicle.status] || {
                      label: detail.vehicle.status,
                      color: "text-slate-500",
                      bg: "bg-slate-100 border-slate-300",
                      dot: "bg-slate-400",
                    };
                    return (
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${sc.bg} ${sc.color}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${sc.dot}`} />{" "}
                        {sc.label}
                      </span>
                    );
                  })()}
                  <span
                    className={`font-mono text-xs px-2.5 py-1 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                  >
                    {detail.vehicle.barcode}
                  </span>
                </div>

                {/* Title */}
                <h2
                  className={`text-xl sm:text-2xl font-black mb-1 ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  {detail.vehicle.brandName} {detail.vehicle.modelName}
                </h2>
                <p
                  className={`text-base sm:text-lg ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                >
                  {detail.vehicle.year} • {detail.vehicle.color}
                </p>

                {/* Price */}
                <div className="mt-3 sm:mt-4 mb-3 sm:mb-4">
                  <p
                    className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Harga Permintaan
                  </p>
                  <p
                    className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {formatPrice(detail.vehicle.askingPrice)}
                  </p>
                </div>

                {/* Quick Specs */}
                <div
                  className={`grid grid-cols-2 gap-3 p-4 rounded-xl mb-4 ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}
                >
                  <div className="flex items-center gap-2">
                    <BsSpeedometer2 className="text-emerald-500" />
                    <div>
                      <p
                        className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Kilometer
                      </p>
                      <p
                        className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                      >
                        {formatMileage(detail.vehicle.mileage)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TbManualGearbox className="text-emerald-500" />
                    <div>
                      <p
                        className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Transmisi
                      </p>
                      <p
                        className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                      >
                        {detail.vehicle.transmission === "matic"
                          ? "Matic"
                          : "Manual"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BsFuelPump className="text-emerald-500" />
                    <div>
                      <p
                        className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Bahan Bakar
                      </p>
                      <p
                        className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                      >
                        {detail.vehicle.fuelType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-emerald-500" />
                    <div>
                      <p
                        className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Tahun
                      </p>
                      <p
                        className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                      >
                        {detail.vehicle.year}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Current Zone */}
                {detail.currentZone && (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 ${isDark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"}`}
                  >
                    <FiMapPin className="text-emerald-500" />
                    <span
                      className={`text-sm font-medium ${isDark ? "text-emerald-400" : "text-emerald-700"}`}
                    >
                      Zona: {detail.currentZone.name} ({detail.currentZone.code}
                      )
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {detail.workflow?.allowedActions?.canInspect && (
                    <Link
                      href={generateUrlWithEncryptedParams(
                        "/warehouse/inspections/create",
                        { vehicleId: detail.vehicle.id },
                      )}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 font-semibold text-sm hover:bg-yellow-500/25 transition-colors border border-yellow-500/30"
                    >
                      <FiClipboard /> Inspeksi
                    </Link>
                  )}
                  {(detail.workflow?.allowedActions?.canCreateRepair ||
                    detail.repairs.length > 0) && (
                    <Link
                      href={generateUrlWithEncryptedParams(
                        "/warehouse/repairs/create",
                        { vehicleId: detail.vehicle.id },
                      )}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 font-semibold text-sm hover:bg-orange-500/25 transition-colors border border-orange-500/30"
                    >
                      <FiTool /> Repair
                    </Link>
                  )}
                  {detail.workflow?.allowedActions?.canViewDisbursement &&
                    detail.workflow?.activeDisbursementId && (
                      <Link
                        href={`/warehouse/disbursements/${encryptSlug(detail.workflow.activeDisbursementId)}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-sm hover:bg-emerald-500/20 transition-colors border border-emerald-500/30"
                      >
                        <FiDollarSign /> Lihat Pencairan
                      </Link>
                    )}
                  {detail.workflow?.allowedActions?.canMarkReady && (
                    <button
                      onClick={() => {
                        dispatch(
                          markVehicleReadyAndPlace({
                            vehicleId: detail.vehicle.id,
                          }),
                        );
                      }}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/15 text-green-600 dark:text-green-400 font-semibold text-sm hover:bg-green-500/25 transition-colors border border-green-500/30 disabled:opacity-50"
                    >
                      <FiCheck /> Sudah Siap Jual
                    </button>
                  )}
                  {(detail.workflow?.allowedActions?.canPublishListing ||
                    detail.workflow?.allowedActions?.canUnpublishListing) && (
                    <Link
                      href={`/warehouse/vehicles/${encryptSlug(detail.vehicle.id)}/publish`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold text-sm hover:bg-purple-500/25 transition-colors border border-purple-500/30"
                    >
                      <FiEye /> Kelola Listing
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}
            >
              <div className="flex overflow-x-auto">
                {[
                  { key: "info", label: "Informasi", icon: FiFileText },
                  { key: "inspection", label: "Inspeksi", icon: FiClipboard },
                  { key: "repair", label: "Perbaikan", icon: FiTool },
                  { key: "history", label: "Riwayat", icon: FiBarChart2 },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                        : `border-transparent ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`
                    }`}
                  >
                    <tab.icon /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "info" && (
                <InfoTab detail={detail} isDark={isDark} />
              )}
              {activeTab === "inspection" && (
                <InspectionTab
                  inspections={detail.inspections}
                  isDark={isDark}
                />
              )}
              {activeTab === "repair" && (
                <RepairTab repairs={detail.repairs} isDark={isDark} />
              )}
              {activeTab === "history" && (
                <HistoryTab detail={detail} isDark={isDark} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================
// ACTION BUTTON
// ============================
const ActionButton = ({
  action,
  vehicle,
  actionLoading,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vehicle: any;
  actionLoading: boolean;
}) => {
  const buttonStyles: Record<string, string> = {
    submit_inspection:
      "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/25",
    view_listing:
      "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/25",
    create_payment:
      "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/25",
    create_repair:
      "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/25",
  };

  const icons: Record<string, React.ReactNode> = {
    submit_inspection: <FiClipboard />,
    view_listing: <FiEye />,
    create_payment: <FiDollarSign />,
    create_repair: <FiTool />,
  };

  const style =
    buttonStyles[action.key] ||
    "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30 hover:bg-slate-500/25";

  // For link-based actions
  if (action.key === "submit_inspection") {
    return (
      <Link
        href={generateUrlWithEncryptedParams("/warehouse/inspections/create", {
          vehicleId: vehicle.id,
        })}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors border ${style}`}
      >
        {icons[action.key]} {action.label}
      </Link>
    );
  }

  return (
    <button
      disabled={actionLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors border disabled:opacity-50 ${style}`}
    >
      {icons[action.key] || <FiEye />} {action.label}
    </button>
  );
};

// ============================
// INFO TAB
// ============================
const InfoTab = ({
  detail,
  isDark,
}: {
  detail: ShowroomViewVehicleDetail;
  isDark: boolean;
}) => {
  const v = detail.vehicle;
  const cardClass = `rounded-xl border p-4 ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-slate-50 border-slate-200"}`;
  const labelClass = `text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`;
  const valueClass = `text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Vehicle Details */}
      <div className={cardClass}>
        <h4
          className={`flex items-center gap-2 text-sm font-bold mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
        >
          <FiTag /> Detail Kendaraan
        </h4>
        <div className="space-y-3">
          {[
            { label: "Plat Nomor", value: v.licensePlate },
            { label: "No. Rangka", value: v.chassisNumber },
            { label: "No. Mesin", value: v.engineNumber },
            { label: "Kondisi", value: v.condition },
            { label: "Kepemilikan", value: v.ownershipStatus },
            { label: "Pajak", value: v.taxStatus },
            { label: "Warna", value: v.color },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className={labelClass}>{item.label}</span>
              <span className={valueClass}>{item.value || "-"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seller Info */}
      <div className={cardClass}>
        <h4
          className={`flex items-center gap-2 text-sm font-bold mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
        >
          <FiUser /> Informasi Penjual
        </h4>
        <div className="space-y-3">
          {[
            { label: "Nama", value: v.sellerName },
            { label: "Telepon", value: v.sellerPhone },
            { label: "WhatsApp", value: v.sellerWhatsapp },
            { label: "KTP", value: v.sellerKtp },
            {
              label: "Lokasi",
              value:
                v.locationCity && v.locationProvince
                  ? `${v.locationCity}, ${v.locationProvince}`
                  : "-",
            },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className={labelClass}>{item.label}</span>
              <span className={valueClass}>{item.value || "-"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {v.description && (
        <div className={`${cardClass} md:col-span-2`}>
          <h4
            className={`flex items-center gap-2 text-sm font-bold mb-3 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
          >
            <FiFileText /> Deskripsi
          </h4>
          <p
            className={`text-sm whitespace-pre-line ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            {v.description}
          </p>
        </div>
      )}

      {/* Notes */}
      {v.notes && (
        <div className={`${cardClass} md:col-span-2`}>
          <h4
            className={`flex items-center gap-2 text-sm font-bold mb-3 ${isDark ? "text-yellow-400" : "text-yellow-600"}`}
          >
            <FiFileText /> Catatan Internal
          </h4>
          <p
            className={`text-sm whitespace-pre-line ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            {v.notes}
          </p>
        </div>
      )}

      {/* Variant & Price Reference */}
      {v.variant && (
        <div className={cardClass}>
          <h4
            className={`flex items-center gap-2 text-sm font-bold mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
          >
            <FiBarChart2 /> Referensi Harga
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={labelClass}>Varian</span>
              <span className={valueClass}>{v.variant.variantName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={labelClass}>Kode Varian</span>
              <span className={valueClass}>{v.variant.variantCode}</span>
            </div>
            {v.yearPrice && (
              <div className="flex justify-between items-center">
                <span className={labelClass}>Harga Pasaran</span>
                <span className={valueClass}>
                  {formatPrice(v.yearPrice.basePrice)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Showroom Info */}
      {v.showroom && (
        <div className={cardClass}>
          <h4
            className={`flex items-center gap-2 text-sm font-bold mb-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
          >
            <BsBuilding /> Showroom
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={labelClass}>Nama</span>
              <span className={valueClass}>{v.showroom.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={labelClass}>Kode</span>
              <span className={valueClass}>{v.showroom.code}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={labelClass}>Lokasi</span>
              <span className={valueClass}>
                {v.showroom.city}, {v.showroom.province}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================
// INSPECTION TAB
// ============================
const InspectionTab = ({
  inspections,
  isDark,
}: {
  inspections: Array<{
    id: string;
    inspectionType?: string;
    overallResult?: string;
    documentStatus?: string;
    exteriorScore?: number;
    interiorScore?: number;
    engineScore?: number;
    electricalScore?: number;
    chassisScore?: number;
    hasBpkb?: boolean;
    hasStnk?: boolean;
    hasFaktur?: boolean;
    hasKtp?: boolean;
    hasSpareKey?: boolean;
    repairNotes?: string;
    rejectionReason?: string;
    inspectedAt?: string;
    createdAt?: string;
  }>;
  isDark: boolean;
}) => {
  if (!inspections || inspections.length === 0) {
    return (
      <div className="text-center py-12">
        <FiClipboard className="text-4xl mx-auto mb-3 text-slate-400" />
        <p
          className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
        >
          Belum ada inspeksi
        </p>
      </div>
    );
  }

  const resultColors: Record<string, string> = {
    accepted_ready:
      "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    accepted_repair:
      "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
    rejected: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  };

  const resultLabels: Record<string, string> = {
    accepted_ready: "Diterima - Siap",
    accepted_repair: "Diterima - Perlu Repair",
    rejected: "Ditolak",
  };

  return (
    <div className="space-y-4">
      {inspections.map((ins) => (
        <div
          key={ins.id}
          className={`rounded-xl border p-5 ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${resultColors[ins.overallResult || ""] || "bg-slate-100 text-slate-500 border-slate-200"}`}
              >
                {resultLabels[ins.overallResult || ""] || ins.overallResult}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-md ${isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}
              >
                {ins.inspectionType}
              </span>
            </div>
            <span
              className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              {ins.inspectedAt
                ? formatDateTime(ins.inspectedAt)
                : ins.createdAt
                  ? formatDateTime(ins.createdAt)
                  : "-"}
            </span>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {[
              { label: "Eksterior", score: ins.exteriorScore },
              { label: "Interior", score: ins.interiorScore },
              { label: "Mesin", score: ins.engineScore },
              { label: "Kelistrikan", score: ins.electricalScore },
              { label: "Rangka", score: ins.chassisScore },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p
                  className={`text-[10px] mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  {s.label}
                </p>
                <div
                  className={`text-lg font-black ${
                    (s.score ?? 0) >= 7
                      ? "text-green-500"
                      : (s.score ?? 0) >= 4
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {s.score ?? "-"}
                </div>
              </div>
            ))}
          </div>

          {/* Documents */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "BPKB", has: ins.hasBpkb },
              { label: "STNK", has: ins.hasStnk },
              { label: "Faktur", has: ins.hasFaktur },
              { label: "KTP", has: ins.hasKtp },
              { label: "Kunci Cadangan", has: ins.hasSpareKey },
            ].map((doc) => (
              <span
                key={doc.label}
                className={`text-xs px-2 py-1 rounded-md border ${
                  doc.has
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                }`}
              >
                {doc.has ? "✓" : "✗"} {doc.label}
              </span>
            ))}
          </div>

          {ins.repairNotes && (
            <p
              className={`mt-3 text-xs p-2 rounded-lg ${isDark ? "bg-slate-700/50 text-slate-300" : "bg-slate-50 text-slate-600"}`}
            >
              <strong>Catatan Repair:</strong> {ins.repairNotes}
            </p>
          )}

          {ins.rejectionReason && (
            <p
              className={`mt-3 text-xs p-2 rounded-lg bg-red-500/10 text-red-500`}
            >
              <strong>Alasan Penolakan:</strong> {ins.rejectionReason}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================
// REPAIR TAB
// ============================
const RepairTab = ({
  repairs,
  isDark,
}: {
  repairs: RepairOrder[];
  isDark: boolean;
}) => {
  if (!repairs || repairs.length === 0) {
    return (
      <div className="text-center py-12">
        <FiTool className="text-4xl mx-auto mb-3 text-slate-400" />
        <p
          className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
        >
          Belum ada perbaikan
        </p>
      </div>
    );
  }

  const repairStatusColors: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
    in_progress: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    completed: "bg-green-500/15 text-green-600 dark:text-green-400",
    cancelled: "bg-red-500/15 text-red-500",
  };

  return (
    <div className="space-y-4">
      {repairs.map((r) => (
        <div
          key={r.id}
          className={`rounded-xl border p-5 ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${repairStatusColors[r.status] || ""}`}
              >
                {r.status}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-md ${isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}
              >
                {r.repairType === "light" ? "Ringan" : "Berat"}
              </span>
            </div>
            <span
              className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              {formatDateTime(r.createdAt)}
            </span>
          </div>
          <p
            className={`text-sm mb-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}
          >
            {r.description}
          </p>
          <div className="flex gap-4">
            {r.estimatedCost && (
              <span
                className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                Est: {formatPrice(r.estimatedCost)}
              </span>
            )}
            {r.actualCost && (
              <span
                className={`text-xs font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
              >
                Aktual: {formatPrice(r.actualCost)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================
// HISTORY TAB
// ============================
const HistoryTab = ({
  detail,
  isDark,
}: {
  detail: ShowroomViewVehicleDetail;
  isDark: boolean;
}) => {
  const hasHistory =
    (detail.placementHistory?.length || 0) > 0 ||
    (detail.stockLogs?.length || 0) > 0;

  if (!hasHistory) {
    return (
      <div className="text-center py-12">
        <FiBarChart2 className="text-4xl mx-auto mb-3 text-slate-400" />
        <p
          className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
        >
          Belum ada riwayat
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Placement History */}
      {detail.placementHistory && detail.placementHistory.length > 0 && (
        <div>
          <h4
            className={`flex items-center gap-2 text-sm font-bold mb-3 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
          >
            <FiMapPin /> Riwayat Penempatan
          </h4>
          <div className="space-y-2">
            {detail.placementHistory.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}
              >
                <div>
                  <span
                    className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {p.zone?.name || "Zone"} ({p.action})
                  </span>
                  {p.isCurrent && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold">
                      Saat ini
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  {formatDateTime(p.placedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Logs */}
      {detail.stockLogs && detail.stockLogs.length > 0 && (
        <div>
          <h4
            className={`flex items-center gap-2 text-sm font-bold mb-3 ${isDark ? "text-purple-400" : "text-purple-600"}`}
          >
            <FiBarChart2 /> Log Stok
          </h4>
          <div className="space-y-2">
            {detail.stockLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-center justify-between p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}
              >
                <div>
                  <span
                    className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {log.action.replace(/_/g, " ")}
                  </span>
                  {log.previousStatus && log.newStatus && (
                    <span
                      className={`ml-2 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
                    >
                      {log.previousStatus} → {log.newStatus}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  {formatDateTime(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchases */}
      {detail.purchases && detail.purchases.length > 0 && (
        <div>
          <h4
            className={`flex items-center gap-2 text-sm font-bold mb-3 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}
          >
            <FiDollarSign /> Transaksi Pembelian
          </h4>
          <div className="space-y-2">
            {detail.purchases.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}
              >
                <div>
                  <p
                    className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {p.buyerName} - {formatPrice(p.totalPrice)}
                  </p>
                  <p
                    className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {p.invoiceNumber} • {p.paymentType}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    p.status === "completed"
                      ? "bg-green-500/15 text-green-500"
                      : "bg-yellow-500/15 text-yellow-500"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Import RepairOrder type for RepairTab
import type { RepairOrder } from "@/lib/state/slice/warehouse/warehouseSlice";

export default ShowroomView;
