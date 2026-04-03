"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/state/store";
import {
  fetchRepairDetail,
  clearSelectedRepair,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import Link from "next/link";
import {
  FiArrowLeft,
  FiTool,
  FiTruck,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiPlay,
} from "react-icons/fi";
import { useTheme } from "@/context/ThemeContext";
import { encryptSlug } from "@/lib/slug/slug";

interface RepairDetailViewProps {
  repairId: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Menunggu",
    color: "text-yellow-500",
    bg: "bg-yellow-500/15 border-yellow-500/30",
    icon: <FiClock size={14} />,
  },
  in_progress: {
    label: "Sedang Dikerjakan",
    color: "text-blue-500",
    bg: "bg-blue-500/15 border-blue-500/30",
    icon: <FiPlay size={14} />,
  },
  completed: {
    label: "Selesai",
    color: "text-emerald-500",
    bg: "bg-emerald-500/15 border-emerald-500/30",
    icon: <FiCheckCircle size={14} />,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "text-red-500",
    bg: "bg-red-500/15 border-red-500/30",
    icon: <FiXCircle size={14} />,
  },
};

const typeConfig: Record<string, { label: string; desc: string; color: string; bg: string }> = {
  light: {
    label: "Perbaikan Ringan",
    desc: "Perbaikan minor yang tidak memerlukan waktu lama",
    color: "text-sky-500",
    bg: "bg-sky-500/15 border-sky-500/30",
  },
  heavy: {
    label: "Perbaikan Berat",
    desc: "Perbaikan major yang memerlukan penanganan khusus",
    color: "text-orange-500",
    bg: "bg-orange-500/15 border-orange-500/30",
  },
};

const RepairDetailView: React.FC<RepairDetailViewProps> = ({ repairId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { selectedRepair, loading } = useSelector(
    (state: RootState) => state.warehouse
  );

  useEffect(() => {
    dispatch(fetchRepairDetail(repairId));
    return () => {
      dispatch(clearSelectedRepair());
    };
  }, [dispatch, repairId]);

  const formatDate = (d?: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (n?: number) =>
    n
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(n)
      : "-";

  const cardClass = `${
    isDark
      ? "bg-slate-800/50 border-slate-700/50"
      : "bg-white border-slate-200 shadow-sm"
  } border rounded-2xl`;

  if (loading || !selectedRepair) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
        <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Memuat detail perbaikan...
        </p>
      </div>
    );
  }

  const repair = selectedRepair;
  const vehicle = repair.warehouseVehicle;
  const currentStatus = statusConfig[repair.status] || statusConfig.pending;
  const currentType = typeConfig[repair.repairType] || typeConfig.light;

  // Timeline steps
  const timelineSteps = [
    {
      label: "Dibuat",
      date: repair.createdAt,
      done: true,
      icon: <FiFileText size={14} />,
    },
    {
      label: "Dikerjakan",
      date: repair.startedAt,
      done: repair.status === "in_progress" || repair.status === "completed",
      icon: <FiTool size={14} />,
    },
    {
      label: "Selesai",
      date: repair.completedAt,
      done: repair.status === "completed",
      icon: <FiCheckCircle size={14} />,
    },
  ];

  if (repair.status === "cancelled") {
    timelineSteps[1] = {
      label: "Dibatalkan",
      date: repair.updatedAt,
      done: true,
      icon: <FiXCircle size={14} />,
    };
    timelineSteps.splice(2, 1);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/warehouse/repairs"
            className={`p-2 rounded-xl shrink-0 transition-colors ${
              isDark
                ? "bg-slate-800/50 hover:bg-slate-800 text-slate-400"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            <FiArrowLeft className="text-xl" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1
              className={`text-xl sm:text-2xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Detail Perbaikan
            </h1>
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Informasi lengkap repair order
            </p>
          </div>
        </div>

        {/* Status & Type badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${currentStatus.bg} ${currentStatus.color}`}
          >
            {currentStatus.icon} {currentStatus.label}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border ${currentType.bg} ${currentType.color}`}
          >
            <FiTool size={12} /> {currentType.label}
          </span>
        </div>
      </div>

      {/* Vehicle Info Card */}
      {vehicle && (
        <div className={`${cardClass} p-6`}>
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isDark
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-blue-50 text-blue-500"
              }`}
            >
              <FiTruck className="text-2xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {vehicle.brandName} {vehicle.modelName}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span
                  className={`text-sm ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {vehicle.year}
                </span>
                <span
                  className={`text-sm font-mono ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {vehicle.licensePlate}
                </span>
                <span
                  className={`text-xs font-mono ${
                    isDark ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  {vehicle.barcode}
                </span>
                {vehicle.color && (
                  <span
                    className={`text-xs ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {vehicle.color}
                  </span>
                )}
              </div>
            </div>
            <Link
              href={`/warehouse/vehicles/${encryptSlug(vehicle.id)}`}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isDark
                  ? "bg-slate-700/60 hover:bg-slate-700 text-slate-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              Lihat Kendaraan
            </Link>
          </div>
        </div>
      )}

      {/* Repair Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Description */}
        <div className={`${cardClass} p-6 sm:col-span-2`}>
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDark
                  ? "bg-orange-500/10 text-orange-400"
                  : "bg-orange-50 text-orange-500"
              }`}
            >
              <FiTool size={20} />
            </div>
            <div className="flex-1">
              <p
                className={`text-xs font-medium mb-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Deskripsi Perbaikan
              </p>
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                {repair.description || "-"}
              </p>
            </div>
          </div>

          {/* Type info */}
          <div
            className={`mt-4 pt-4 border-t ${
              isDark ? "border-slate-700/50" : "border-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${currentType.bg} ${currentType.color}`}
              >
                <FiTool size={11} />
                {currentType.label}
              </span>
              <span
                className={`text-xs ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {currentType.desc}
              </span>
            </div>
          </div>
        </div>

        {/* Estimated Cost */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isDark
                  ? "bg-slate-700/50 text-slate-400"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <FiDollarSign size={16} />
            </div>
            <p
              className={`text-xs font-medium ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Estimasi Biaya
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {formatPrice(repair.estimatedCost)}
          </p>
        </div>

        {/* Actual Cost */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                repair.actualCost
                  ? isDark
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-emerald-50 text-emerald-500"
                  : isDark
                    ? "bg-slate-700/50 text-slate-400"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              <FiDollarSign size={16} />
            </div>
            <p
              className={`text-xs font-medium ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Biaya Aktual
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              repair.actualCost
                ? "text-emerald-500"
                : isDark
                  ? "text-slate-600"
                  : "text-slate-300"
            }`}
          >
            {repair.actualCost ? formatPrice(repair.actualCost) : "Belum ada"}
          </p>
          {repair.estimatedCost && repair.actualCost && (
            <p className="text-xs mt-1.5">
              {repair.actualCost <= repair.estimatedCost ? (
                <span className="text-emerald-500">
                  Sesuai anggaran (
                  {Math.round(
                    (repair.actualCost / repair.estimatedCost) * 100
                  )}
                  %)
                </span>
              ) : (
                <span className="text-red-500">
                  <FiAlertTriangle className="inline mr-1" size={11} />
                  Melebihi anggaran (+
                  {formatPrice(repair.actualCost - repair.estimatedCost)})
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className={`${cardClass} p-6`}>
        <h3
          className={`text-sm font-semibold mb-5 ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          Timeline Perbaikan
        </h3>
        <div className="relative">
          {timelineSteps.map((step, idx) => {
            const isLast = idx === timelineSteps.length - 1;
            const isCancelled =
              repair.status === "cancelled" && idx === timelineSteps.length - 1;

            return (
              <div key={step.label} className="flex gap-4 relative">
                {/* Line */}
                {!isLast && (
                  <div
                    className={`absolute left-[15px] top-[32px] w-0.5 bottom-0 ${
                      step.done
                        ? isCancelled
                          ? "bg-red-500/30"
                          : "bg-emerald-500/30"
                        : isDark
                          ? "bg-slate-700"
                          : "bg-slate-200"
                    }`}
                  />
                )}
                {/* Dot */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    step.done
                      ? isCancelled
                        ? "bg-red-500 text-white"
                        : "bg-emerald-500 text-white"
                      : isDark
                        ? "bg-slate-700 text-slate-500 border-2 border-slate-600"
                        : "bg-slate-100 text-slate-400 border-2 border-slate-200"
                  }`}
                >
                  {step.icon}
                </div>
                {/* Content */}
                <div className={`flex-1 pb-6 ${isLast ? "pb-0" : ""}`}>
                  <p
                    className={`text-sm font-semibold ${
                      step.done
                        ? isDark
                          ? "text-white"
                          : "text-slate-900"
                        : isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {step.date ? formatDate(step.date) : "Belum ada"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assigned To */}
      {repair.assignedToId && (
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark
                  ? "bg-slate-700/50 text-slate-400"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <FiUser size={18} />
            </div>
            <div>
              <p
                className={`text-xs font-medium ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Ditugaskan kepada
              </p>
              <p
                className={`text-sm font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {repair.assignedToId}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div
        className={`flex flex-wrap items-center gap-x-6 gap-y-1 px-2 pb-4 text-[11px] ${
          isDark ? "text-slate-600" : "text-slate-400"
        }`}
      >
        <span>
          <FiCalendar className="inline mr-1" size={10} />
          Dibuat: {formatDate(repair.createdAt)}
        </span>
        <span>Diperbarui: {formatDate(repair.updatedAt)}</span>
        {repair.startedAt && <span>Mulai dikerjakan: {formatDate(repair.startedAt)}</span>}
        {repair.completedAt && (
          <span>Selesai: {formatDate(repair.completedAt)}</span>
        )}
      </div>
    </div>
  );
};

export default RepairDetailView;
