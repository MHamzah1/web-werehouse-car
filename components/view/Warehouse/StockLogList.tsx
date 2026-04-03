"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/state/store";
import {
  fetchStockLogs,
  fetchStockSummary,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import {
  FiActivity,
  FiArrowUpRight,
  FiArrowDownRight,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";
import { useTheme } from "@/context/ThemeContext";

const actionConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  vehicle_in: {
    label: "Masuk",
    icon: FiArrowUpRight,
    color: "bg-green-500/20 text-green-400",
  },
  vehicle_out: {
    label: "Keluar",
    icon: FiArrowDownRight,
    color: "bg-red-500/20 text-red-400",
  },
  status_change: {
    label: "Status",
    icon: FiRefreshCw,
    color: "bg-blue-500/20 text-blue-400",
  },
  zone_transfer: {
    label: "Pindah Zona",
    icon: FiArrowRight,
    color: "bg-purple-500/20 text-purple-400",
  },
};

const StockLogList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { stockLogs, stockSummary, selectedShowroom, loading } = useSelector(
    (state: RootState) => state.warehouse,
  );

  useEffect(() => {
    if (selectedShowroom?.id) {
      dispatch(fetchStockLogs({ showroomId: selectedShowroom.id }));
      dispatch(fetchStockSummary(selectedShowroom.id));
    }
  }, [dispatch, selectedShowroom]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
        >
          Stok Log
        </h1>
        <p
          className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          Audit trail perubahan stok warehouse
        </p>
      </div>

      {/* Summary Cards */}
      {stockSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Kendaraan"
            value={stockSummary.totalVehicles}
            color="emerald"
          />
          <SummaryCard
            label="Masuk Bulan Ini"
            value={stockSummary.monthlyIn}
            color="green"
          />
          <SummaryCard
            label="Keluar Bulan Ini"
            value={stockSummary.monthlyOut}
            color="red"
          />
          <SummaryCard
            label="Nett"
            value={stockSummary.monthlyIn - stockSummary.monthlyOut}
            color="blue"
          />
        </div>
      )}

      {/* Log Timeline */}
      <div
        className={`${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl p-4 sm:p-6`}
      >
        <h3
          className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
        >
          <FiActivity className="text-emerald-400" /> Riwayat Aktivitas
        </h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        ) : stockLogs.length === 0 ? (
          <p
            className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            Belum ada aktivitas stok
          </p>
        ) : (
          <div className="space-y-3">
            {stockLogs.map((log) => {
              const cfg = actionConfig[log.action] || {
                label: log.action,
                icon: FiActivity,
                color: "bg-slate-500/20 text-slate-400",
              };
              const Icon = cfg.icon;
              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${isDark ? "bg-slate-700/30 border-slate-700/50" : "bg-slate-50 border-slate-200"}`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}
                  >
                    <Icon className="text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                        {log.warehouseVehicle && (
                          <span
                            className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}
                          >
                            {log.warehouseVehicle.brandName}{" "}
                            {log.warehouseVehicle.modelName}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 shrink-0">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    {(log.previousStatus || log.newStatus) && (
                      <p
                        className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {log.previousStatus && (
                          <span className="text-slate-500">
                            {log.previousStatus}
                          </span>
                        )}
                        {log.previousStatus && log.newStatus && (
                          <span className="text-slate-600 mx-1">→</span>
                        )}
                        {log.newStatus && (
                          <span className="text-emerald-400">
                            {log.newStatus}
                          </span>
                        )}
                      </p>
                    )}
                    {log.notes && (
                      <p
                        className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {log.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const summaryColors: Record<string, string> = {
  emerald: "text-emerald-400",
  green: "text-green-400",
  red: "text-red-400",
  blue: "text-blue-400",
};

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div
      className={`${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-xl p-3 sm:p-4 text-center`}
    >
      <p
        className={`text-xs mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        {label}
      </p>
      <p className={`text-xl sm:text-2xl font-bold ${summaryColors[color] || "text-slate-400"}`}>{value}</p>
    </div>
  );
}

export default StockLogList;
