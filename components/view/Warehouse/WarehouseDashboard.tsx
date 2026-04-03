"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/state/store";
import {
  fetchShowroomDashboard,
  fetchStockSummary,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import { useTheme } from "@/context/ThemeContext";
import {
  FiTruck,
  FiCheckCircle,
  FiAlertTriangle,
  FiDollarSign,
  FiArrowUpRight,
  FiArrowDownRight,
} from "react-icons/fi";

const getStatusColors = (isDark: boolean): Record<string, string> => ({
  inspecting: isDark
    ? "bg-yellow-500/20 text-yellow-400"
    : "bg-yellow-50 text-yellow-700 border border-yellow-200",
  registered: isDark
    ? "bg-blue-500/20 text-blue-400"
    : "bg-blue-50 text-blue-700 border border-blue-200",
  in_warehouse: isDark
    ? "bg-emerald-500/20 text-emerald-400"
    : "bg-emerald-50 text-emerald-700 border border-emerald-200",
  in_repair: isDark
    ? "bg-orange-500/20 text-orange-400"
    : "bg-orange-50 text-orange-700 border border-orange-200",
  ready: isDark
    ? "bg-green-500/20 text-green-400"
    : "bg-green-50 text-green-700 border border-green-200",
  listed: isDark
    ? "bg-purple-500/20 text-purple-400"
    : "bg-purple-50 text-purple-700 border border-purple-200",
  sold: isDark
    ? "bg-cyan-500/20 text-cyan-400"
    : "bg-cyan-50 text-cyan-700 border border-cyan-200",
  rejected: isDark
    ? "bg-red-500/20 text-red-400"
    : "bg-red-50 text-red-700 border border-red-200",
});

const statusLabels: Record<string, string> = {
  inspecting: "Inspeksi",
  registered: "Terdaftar",
  in_warehouse: "Di Gudang",
  in_repair: "Perbaikan",
  ready: "Siap Jual",
  listed: "Di Marketplace",
  sold: "Terjual",
  rejected: "Ditolak",
};

const WarehouseDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { selectedShowroom, dashboard, stockSummary, loading } = useSelector(
    (state: RootState) => state.warehouse,
  );

  useEffect(() => {
    if (selectedShowroom?.id) {
      dispatch(fetchShowroomDashboard(selectedShowroom.id));
      dispatch(fetchStockSummary(selectedShowroom.id));
    }
  }, [dispatch, selectedShowroom]);

  const totalVehicles =
    dashboard?.totalVehicles ?? stockSummary?.totalVehicles ?? 0;
  const statusCounts =
    dashboard?.statusCounts ?? stockSummary?.statusBreakdown ?? {};
  const statusColors = getStatusColors(isDark);

  // Reusable theme class helpers
  const cardBg = isDark
    ? "bg-slate-800/50 border border-slate-700/50"
    : "bg-white border border-slate-200 shadow-sm";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const textMuted = isDark ? "text-slate-500" : "text-slate-400";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Dashboard Warehouse
        </h1>
        <p className={`${textSecondary} text-xs sm:text-sm mt-1`}>
          {selectedShowroom
            ? `Showroom: ${selectedShowroom.name}`
            : "Pilih showroom di sidebar"}
        </p>
      </div>

      {!selectedShowroom ? (
        <div className={`${cardBg} rounded-2xl p-12 text-center`}>
          <FiTruck className={`text-5xl ${textMuted} mx-auto mb-4`} />
          <h3
            className={`text-lg font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}
          >
            Belum Ada Showroom Dipilih
          </h3>
          <p className={`${textMuted} text-sm mt-2`}>
            Buat showroom terlebih dahulu di menu Showroom
          </p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FiTruck}
              label="Total Kendaraan"
              value={totalVehicles}
              gradient="from-emerald-500 to-teal-600"
              isDark={isDark}
            />
            <StatCard
              icon={FiCheckCircle}
              label="Siap Jual"
              value={statusCounts.ready ?? 0}
              gradient="from-green-500 to-emerald-600"
              isDark={isDark}
            />
            <StatCard
              icon={FiAlertTriangle}
              label="Dalam Perbaikan"
              value={statusCounts.in_repair ?? 0}
              gradient="from-orange-500 to-amber-600"
              isDark={isDark}
            />
            <StatCard
              icon={FiDollarSign}
              label="Terjual"
              value={statusCounts.sold ?? 0}
              gradient="from-cyan-500 to-blue-600"
              isDark={isDark}
            />
          </div>

          {/* Stock In/Out */}
          {stockSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${cardBg} rounded-2xl p-5`}>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDark ? "bg-green-500/20" : "bg-green-100"
                    }`}
                  >
                    <FiArrowUpRight
                      className={`text-xl ${isDark ? "text-green-400" : "text-green-600"}`}
                    />
                  </div>
                  <div>
                    <p className={`${textSecondary} text-sm`}>
                      Masuk Bulan Ini
                    </p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>
                      {stockSummary.monthlyIn}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`${cardBg} rounded-2xl p-5`}>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDark ? "bg-red-500/20" : "bg-red-100"
                    }`}
                  >
                    <FiArrowDownRight
                      className={`text-xl ${isDark ? "text-red-400" : "text-red-600"}`}
                    />
                  </div>
                  <div>
                    <p className={`${textSecondary} text-sm`}>
                      Keluar Bulan Ini
                    </p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>
                      {stockSummary.monthlyOut}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Breakdown */}
          <div className={`${cardBg} rounded-2xl p-6`}>
            <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>
              Status Kendaraan
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className={`rounded-xl p-4 text-center ${
                    statusColors[status] ||
                    (isDark
                      ? "bg-slate-700/50 text-slate-300"
                      : "bg-slate-100 text-slate-600")
                  }`}
                >
                  <p className="text-2xl font-bold">{String(count)}</p>
                  <p className="text-xs font-medium mt-1 opacity-80">
                    {statusLabels[status] || status}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Summary */}
          {dashboard?.zoneSummary && dashboard.zoneSummary.length > 0 && (
            <div className={`${cardBg} rounded-2xl p-6`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>
                Zona Gudang
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dashboard.zoneSummary.map((zs) => (
                  <div
                    key={zs.zone.id}
                    className={`rounded-xl p-4 border ${
                      isDark
                        ? "bg-slate-700/30 border-slate-700/50"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className={`font-semibold ${textPrimary}`}>
                          {zs.zone.name}
                        </p>
                        <p className={`text-xs ${textSecondary}`}>
                          {zs.zone.code}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          isDark
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {zs.zone.type}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={textSecondary}>Kapasitas</span>
                        <span className={`${textPrimary} font-medium`}>
                          {zs.vehicleCount} / {zs.zone.capacity}
                        </span>
                      </div>
                      <div
                        className={`w-full rounded-full h-2 ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                      >
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min((zs.vehicleCount / zs.zone.capacity) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  isDark,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  gradient: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${
        isDark
          ? "bg-slate-800/50 border border-slate-700/50"
          : "bg-white border border-slate-200 shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
        >
          <Icon className="text-white text-xl" />
        </div>
        <div>
          <p
            className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {label}
          </p>
          <p
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default WarehouseDashboard;
