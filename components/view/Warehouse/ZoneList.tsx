"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/state/store";
import {
  fetchZonesByShowroom,
  clearSuccess,
  clearError,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiPlus, FiMapPin } from "react-icons/fi";
import { useTheme } from "@/context/ThemeContext";

const zoneTypeConfig: Record<string, { label: string; color: string }> = {
  ready: { label: "Ready Jual", color: "from-green-500 to-emerald-600" },
  light_repair: {
    label: "Perbaikan Ringan",
    color: "from-blue-500 to-cyan-600",
  },
  heavy_repair: {
    label: "Perbaikan Berat",
    color: "from-orange-500 to-red-600",
  },
  holding: { label: "Holding", color: "from-slate-500 to-slate-600" },
  showroom_display: {
    label: "Display Showroom",
    color: "from-purple-500 to-pink-600",
  },
};

const ZoneList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { zones, selectedShowroom, loading, successMessage, error } =
    useSelector((state: RootState) => state.warehouse);

  useEffect(() => {
    if (selectedShowroom?.id)
      dispatch(fetchZonesByShowroom(selectedShowroom.id));
  }, [dispatch, selectedShowroom]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Zona Gudang
          </h1>
          <p
            className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Kelola zona/area di dalam gudang
          </p>
        </div>
        <Link
          href="/warehouse/zones/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-emerald-500/30 transition-all"
        >
          <FiPlus /> Tambah Zona
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
        </div>
      ) : zones.length === 0 ? (
        <div
          className={`${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} rounded-2xl p-12 text-center border`}
        >
          <FiMapPin className="text-5xl text-slate-500 mx-auto mb-4" />
          <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Belum ada zona. Buat zona gudang pertama!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((z) => {
            const cfg = zoneTypeConfig[z.type] || {
              label: z.type,
              color: "from-slate-500 to-slate-600",
            };
            const pct =
              z.capacity > 0
                ? Math.min((z.currentCount / z.capacity) * 100, 100)
                : 0;
            return (
              <div
                key={z.id}
                className={`${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl p-5 hover:border-emerald-500/30 transition-all`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3
                      className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                    >
                      {z.name}
                    </h3>
                    <span className="text-xs font-mono text-emerald-400">
                      {z.code}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span
                      className={`${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Kapasitas
                    </span>
                    <span
                      className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                    >
                      {z.currentCount} / {z.capacity}
                    </span>
                  </div>
                  <div
                    className={`w-full rounded-full h-3 ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                  >
                    <div
                      className={`bg-gradient-to-r ${cfg.color} h-3 rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p
                    className={`text-xs mt-1 ${pct > 80 ? "text-red-400" : "text-slate-500"}`}
                  >
                    {pct > 80 ? "Hampir penuh!" : `${Math.round(pct)}% terisi`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ZoneList;
