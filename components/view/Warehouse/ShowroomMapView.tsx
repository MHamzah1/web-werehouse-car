"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/state/store";
import {
  fetchShowroomView,
  clearSuccess,
  clearError,
  ShowroomViewVehicle,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { encryptSlug } from "@/lib/slug/slug";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiX,
  FiMapPin,
  FiRefreshCw,
  FiMaximize2,
  FiMinimize2,
} from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";
import { TbCar } from "react-icons/tb";

// ============================
// CONFIGS
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

const zoneTypeConfig: Record<
  string,
  {
    label: string;
    gradient: string;
    border: string;
    headerBg: string;
  }
> = {
  ready: {
    label: "Ready / Siap Jual",
    gradient: "from-green-500/10 to-emerald-500/5",
    border: "border-green-500/40",
    headerBg: "bg-green-500",
  },
  light_repair: {
    label: "Repair Ringan",
    gradient: "from-yellow-500/10 to-amber-500/5",
    border: "border-yellow-500/40",
    headerBg: "bg-yellow-500",
  },
  heavy_repair: {
    label: "Repair Berat",
    gradient: "from-orange-500/10 to-red-500/5",
    border: "border-orange-500/40",
    headerBg: "bg-orange-500",
  },
  holding: {
    label: "Holding Area",
    gradient: "from-blue-500/10 to-indigo-500/5",
    border: "border-blue-500/40",
    headerBg: "bg-blue-500",
  },
  showroom_display: {
    label: "Display Showroom",
    gradient: "from-purple-500/10 to-pink-500/5",
    border: "border-purple-500/40",
    headerBg: "bg-purple-500",
  },
};

// ============================
// HELPERS
// ============================
const formatPrice = (n: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(n));

// ============================
// MAIN COMPONENT
// ============================
const ShowroomMapView = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    selectedShowroom,
    showroomView,
    showroomViewLoading,
    error,
    successMessage,
  } = useSelector((state: RootState) => state.warehouse);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL_IMAGES ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
    "http://localhost:8081";

  // Load data
  const loadData = useCallback(() => {
    if (!selectedShowroom?.id) return;
    dispatch(
      fetchShowroomView({
        showroomId: selectedShowroom.id,
        params: {
          page: 1,
          perPage: 200,
          ...(search ? { search } : {}),
          sortBy: "createdAt",
          sortDirection: "DESC",
        },
      }),
    );
  }, [dispatch, selectedShowroom, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccess());
      loadData();
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, loadData]);

  const handleVehicleDoubleClick = (vehicleId: string) => {
    router.push(`/warehouse/vehicles/${encryptSlug(vehicleId)}`);
  };

  const toggleZoneExpand = (zoneId: string) => {
    setExpandedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) next.delete(zoneId);
      else next.add(zoneId);
      return next;
    });
  };

  const vehicles = showroomView?.vehicles || [];
  const zones = showroomView?.zones || [];
  const showroom = showroomView?.showroom;

  // Group vehicles by zone
  const vehiclesByZone = new Map<string, ShowroomViewVehicle[]>();
  const unassignedVehicles: ShowroomViewVehicle[] = [];
  vehicles.forEach((v) => {
    if (v.currentZone) {
      const arr = vehiclesByZone.get(v.currentZone.id) || [];
      arr.push(v);
      vehiclesByZone.set(v.currentZone.id, arr);
    } else {
      unassignedVehicles.push(v);
    }
  });

  // Summary stats
  const totalVehicles = vehicles.length;
  const totalZones = zones.length;
  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  const totalOccupied = zones.reduce((sum, z) => sum + z.currentCount, 0);

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
    <div className="space-y-6 max-w-[1800px] mx-auto">
      {/* ============ HEADER ============ */}
      <div
        className={`rounded-2xl border overflow-hidden ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"}`}
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiMapPin className="text-white/80" />
                <span className="text-white/70 text-sm font-medium">
                  Showroom Map
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                {showroom?.name || selectedShowroom.name}
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {showroom?.city || selectedShowroom.city},{" "}
                {showroom?.province || selectedShowroom.province}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari kendaraan..."
                  className="pl-9 pr-8 py-2 rounded-xl bg-white/20 text-white placeholder-white/50 text-sm border border-white/20 focus:border-white/40 outline-none backdrop-blur-sm w-full sm:w-56"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    <FiX className="text-sm" />
                  </button>
                )}
              </div>
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium text-sm transition-colors backdrop-blur-sm"
              >
                <FiRefreshCw
                  className={showroomViewLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className={`px-4 sm:px-6 py-3 flex flex-wrap items-center gap-4 sm:gap-6 ${isDark ? "bg-slate-800/30" : "bg-slate-50"}`}
        >
          <div className="flex items-center gap-2">
            <TbCar className={`text-lg ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
            <span className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-700"}`}>
              {totalVehicles}
            </span>
            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              kendaraan
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiMapPin className={`text-sm ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            <span className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-700"}`}>
              {totalZones}
            </span>
            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              zona
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Kapasitas:
            </span>
            <span className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-700"}`}>
              {totalOccupied}/{totalCapacity}
            </span>
            {totalCapacity > 0 && (
              <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    totalOccupied / totalCapacity >= 0.9
                      ? "bg-red-500"
                      : totalOccupied / totalCapacity >= 0.7
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${Math.min((totalOccupied / totalCapacity) * 100, 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
          <div className={`hidden md:block h-4 w-px ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
          <div className="flex flex-wrap items-center gap-3">
            {Object.entries(zoneTypeConfig).map(([type, cfg]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${cfg.headerBg}`} />
                <span
                  className={`text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  {cfg.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ LOADING ============ */}
      {showroomViewLoading && vehicles.length === 0 && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
            <p
              className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Memuat peta showroom...
            </p>
          </div>
        </div>
      )}

      {/* ============ FLOOR MAP ============ */}
      {!showroomViewLoading || vehicles.length > 0 ? (
        <div className="space-y-5">
          {/* Zone Areas */}
          {zones.map((zone) => {
            const cfg = zoneTypeConfig[zone.type] || zoneTypeConfig.holding;
            const zoneVehicles = vehiclesByZone.get(zone.id) || [];
            const pct =
              zone.capacity > 0
                ? Math.round((zone.currentCount / zone.capacity) * 100)
                : 0;
            const isExpanded = expandedZones.has(zone.id);
            const displayVehicles = isExpanded
              ? zoneVehicles
              : zoneVehicles.slice(0, 12);

            return (
              <div
                key={zone.id}
                className={`rounded-2xl border-2 overflow-hidden transition-all ${cfg.border} ${isDark ? "bg-slate-900/50" : "bg-white"}`}
              >
                {/* Zone Header */}
                <div
                  className={`${cfg.headerBg} px-3 sm:px-5 py-3 flex items-center justify-between gap-2`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <FiMapPin className="text-white text-sm" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">
                        {zone.name}
                      </h3>
                      <p className="text-white/70 text-xs">
                        {zone.code} &bull; {cfg.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 sm:w-24 h-2 rounded-full bg-white/20 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-300" : "bg-white/70"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-white/90 text-xs font-bold">
                        {zone.currentCount}/{zone.capacity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Zone Floor */}
                <div className={`p-4 bg-gradient-to-br ${cfg.gradient}`}>
                  {zoneVehicles.length === 0 ? (
                    <div
                      className={`flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed ${isDark ? "border-slate-700 text-slate-600" : "border-slate-200 text-slate-400"}`}
                    >
                      <TbCar className="text-4xl mb-2 opacity-40" />
                      <p className="text-sm font-medium">Zona kosong</p>
                      <p className="text-xs opacity-70">
                        Belum ada kendaraan di zona ini
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        {displayVehicles.map((vehicle) => (
                          <ParkingSlot
                            key={vehicle.id}
                            vehicle={vehicle}
                            isDark={isDark}
                            baseUrl={baseUrl}
                            onDoubleClick={() =>
                              handleVehicleDoubleClick(vehicle.id)
                            }
                          />
                        ))}

                        {/* Empty Parking Slots */}
                        {Array.from({
                          length: Math.max(
                            0,
                            Math.min(
                              zone.capacity - zoneVehicles.length,
                              isExpanded
                                ? zone.capacity - zoneVehicles.length
                                : Math.min(
                                    4,
                                    zone.capacity - zoneVehicles.length,
                                  ),
                            ),
                          ),
                        }).map((_, i) => (
                          <div
                            key={`empty-${i}`}
                            className={`rounded-xl border-2 border-dashed aspect-[4/3] flex items-center justify-center ${isDark ? "border-slate-700/50" : "border-slate-200/80"}`}
                          >
                            <TbCar
                              className={`text-2xl ${isDark ? "text-slate-700" : "text-slate-200"}`}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Show more / less */}
                      {zoneVehicles.length > 12 && (
                        <button
                          onClick={() => toggleZoneExpand(zone.id)}
                          className={`mt-3 flex items-center gap-1.5 mx-auto px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isDark
                              ? "bg-slate-800 text-slate-400 hover:text-white"
                              : "bg-white text-slate-500 hover:text-slate-700"
                          } border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                        >
                          {isExpanded ? (
                            <>
                              <FiMinimize2 /> Tampilkan Lebih Sedikit
                            </>
                          ) : (
                            <>
                              <FiMaximize2 /> Lihat Semua ({zoneVehicles.length}
                              )
                            </>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Unassigned Vehicles */}
          {unassignedVehicles.length > 0 && (
            <div
              className={`rounded-2xl border-2 border-dashed overflow-hidden ${isDark ? "border-slate-600" : "border-slate-300"}`}
            >
              <div
                className={`px-5 py-3 flex items-center justify-between ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                  >
                    <FiMapPin
                      className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}
                    >
                      Belum Ditempatkan
                    </h3>
                    <p
                      className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
                    >
                      Kendaraan belum ditempatkan di zona manapun
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isDark ? "bg-slate-700 text-slate-400" : "bg-white text-slate-500"}`}
                >
                  {unassignedVehicles.length} unit
                </span>
              </div>
              <div
                className={`p-4 ${isDark ? "bg-slate-800/30" : "bg-slate-50/50"}`}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {unassignedVehicles.map((vehicle) => (
                    <ParkingSlot
                      key={vehicle.id}
                      vehicle={vehicle}
                      isDark={isDark}
                      baseUrl={baseUrl}
                      onDoubleClick={() =>
                        handleVehicleDoubleClick(vehicle.id)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No zones and no vehicles */}
          {zones.length === 0 &&
            vehicles.length === 0 &&
            !showroomViewLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <FiMapPin className="text-5xl text-slate-400" />
                <p
                  className={`text-lg font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Belum ada zona atau kendaraan
                </p>
                <p
                  className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  Buat zona terlebih dahulu untuk memulai
                </p>
              </div>
            )}
        </div>
      ) : null}
    </div>
  );
};

// ============================
// PARKING SLOT - Vehicle Card on Map
// ============================
const ParkingSlot = ({
  vehicle,
  isDark,
  baseUrl,
  onDoubleClick,
}: {
  vehicle: ShowroomViewVehicle;
  isDark: boolean;
  baseUrl: string;
  onDoubleClick: () => void;
}) => {
  const sc = statusConfig[vehicle.status] || {
    label: vehicle.status,
    dot: "bg-slate-400",
    color: "text-slate-500",
    bg: "bg-slate-100 border-slate-300",
  };
  const getImageUrl = (url: string) =>
    url?.startsWith("http") ? url : baseUrl + url;

  const thumbnail = vehicle.thumbnail || vehicle.images?.[0];

  return (
    <div
      onDoubleClick={onDoubleClick}
      className={`group relative rounded-xl overflow-hidden border transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer select-none ${
        isDark
          ? "bg-slate-800 border-slate-700 hover:border-emerald-500/50 hover:shadow-emerald-500/10"
          : "bg-white border-slate-200 hover:border-emerald-500/50 hover:shadow-emerald-500/10"
      }`}
      title="Klik 2x untuk lihat detail"
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-slate-900">
        {thumbnail ? (
          <img
            src={getImageUrl(thumbnail)}
            alt={`${vehicle.brandName} ${vehicle.modelName}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TbCar
              className={`text-3xl ${isDark ? "text-slate-700" : "text-slate-300"}`}
            />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-1.5 right-1.5">
          <span
            className={`block w-2.5 h-2.5 rounded-full ${sc.dot} ring-2 ring-white dark:ring-slate-900`}
            title={sc.label}
          />
        </div>

        {/* License Plate */}
        <div
          className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold ${
            isDark ? "bg-black/60 text-white" : "bg-white/90 text-slate-700"
          } backdrop-blur-sm`}
        >
          {vehicle.licensePlate}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
          <span className="text-white text-[9px] font-medium bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
            Klik 2x untuk detail
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <p
          className={`text-[10px] font-bold truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}
        >
          {vehicle.brandName} {vehicle.modelName}
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <p
            className={`text-[9px] truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            {vehicle.year} &bull; {vehicle.color}
          </p>
        </div>
        <p className="text-[9px] font-bold text-emerald-500 truncate mt-0.5">
          {formatPrice(vehicle.askingPrice)}
        </p>
      </div>
    </div>
  );
};

export default ShowroomMapView;
