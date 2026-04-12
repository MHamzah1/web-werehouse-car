"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/state/store";
import {
  fetchInspectionDetail,
  clearSelectedInspection,
  InspectionItem,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import Link from "next/link";
import {
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiCamera,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiClipboard,
  FiTruck,
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
} from "react-icons/fi";
import { useTheme } from "@/context/ThemeContext";
import { CONDITION_OPTIONS, INSPECTION_CATEGORIES } from "./INSPECTION_TEMPLATE";

interface InspectionDetailViewProps {
  inspectionId: string;
}

const CONDITION_MAP: Record<string, { label: string; color: string; bg: string; darkBg: string }> = {};
CONDITION_OPTIONS.forEach((o) => {
  CONDITION_MAP[o.value] = {
    label: o.label,
    color: o.color,
    bg: o.bg,
    darkBg:
      o.value === "good"
        ? "bg-green-500/15"
        : o.value === "fair"
          ? "bg-yellow-500/15"
          : o.value === "poor"
            ? "bg-orange-500/15"
            : o.value === "damaged"
              ? "bg-red-500/15"
              : "bg-gray-500/15",
  };
});

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {};
INSPECTION_CATEGORIES.forEach((c) => {
  CATEGORY_LABELS[c.category] = { label: c.label, icon: c.icon };
});

const InspectionDetailView: React.FC<InspectionDetailViewProps> = ({
  inspectionId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { selectedInspection, loading } = useSelector(
    (state: RootState) => state.warehouse
  );

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL_IMAGES ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
    "http://localhost:8081";
  const getImageUrl = (url: string) =>
    url?.startsWith("http") ? url : baseUrl + url;

  useEffect(() => {
    dispatch(fetchInspectionDetail(inspectionId));
    return () => {
      dispatch(clearSelectedInspection());
    };
  }, [dispatch, inspectionId]);

  // Expand all categories by default once data loads
  useEffect(() => {
    if (selectedInspection?.items) {
      const cats = new Set<string>();
      selectedInspection.items.forEach((item) => cats.add(item.category));
      setExpandedCategories(cats);
    }
  }, [selectedInspection]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDateShort = (d?: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const cardClass = `${
    isDark
      ? "bg-slate-800/50 border-slate-700/50"
      : "bg-white border-slate-200 shadow-sm"
  } border rounded-2xl`;

  if (loading || !selectedInspection) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
        <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Memuat detail inspeksi...
        </p>
      </div>
    );
  }

  const insp = selectedInspection;
  const items = insp.items || [];

  // Group items by category
  const groupedItems: Record<string, InspectionItem[]> = {};
  items.forEach((item) => {
    if (!groupedItems[item.category]) groupedItems[item.category] = [];
    groupedItems[item.category].push(item);
  });

  // Stats
  const goodCount = items.filter((i) => i.condition === "good").length;
  const fairCount = items.filter((i) => i.condition === "fair").length;
  const poorCount = items.filter((i) => i.condition === "poor").length;
  const damagedCount = items.filter((i) => i.condition === "damaged").length;
  const naCount = items.filter((i) => i.condition === "na").length;
  const totalPhotos = items.reduce(
    (acc, i) => acc + (i.photos?.length || 0),
    0
  );
  const totalItems = items.length;

  // Score calculation
  const conditionScore: Record<string, number> = {
    good: 4,
    fair: 3,
    poor: 2,
    damaged: 1,
    na: 0,
  };
  const scoredItems = items.filter((i) => i.condition !== "na");
  const avgScore =
    scoredItems.length > 0
      ? scoredItems.reduce((acc, i) => acc + (conditionScore[i.condition] || 0), 0) / scoredItems.length
      : 0;
  const scorePercent = (avgScore / 4) * 100;

  // Status display config
  const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    draft: { label: "Draft", cls: "bg-slate-500/15 text-slate-400 border-slate-500/30", icon: <FiClipboard size={14} /> },
    submitted: { label: "Menunggu Review", cls: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30", icon: <FiClock size={14} /> },
    approved: { label: "Disetujui", cls: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", icon: <FiCheckCircle size={14} /> },
    rejected_by_head: { label: "Ditolak", cls: "bg-red-500/15 text-red-500 border-red-500/30", icon: <FiXCircle size={14} /> },
  };

  const resultConfig: Record<string, { label: string; cls: string }> = {
    accepted_ready: { label: "Siap Jual", cls: "bg-green-500/15 text-green-500" },
    accepted_repair: { label: "Perlu Perbaikan", cls: "bg-orange-500/15 text-orange-500" },
    rejected: { label: "Ditolak", cls: "bg-red-500/15 text-red-500" },
  };

  const typeConfig: Record<string, { label: string; cls: string }> = {
    initial: { label: "Inspeksi Awal", cls: "bg-blue-500/15 text-blue-500" },
    re_inspection: { label: "Re-Inspeksi", cls: "bg-purple-500/15 text-purple-500" },
    qc: { label: "Quality Control", cls: "bg-teal-500/15 text-teal-500" },
  };

  const currentStatus = statusConfig[insp.status || "draft"] || statusConfig.draft;
  const currentResult = insp.overallResult ? resultConfig[insp.overallResult] : null;
  const currentType = typeConfig[insp.inspectionType] || { label: insp.inspectionType, cls: "bg-slate-500/15 text-slate-400" };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={getImageUrl(selectedPhoto)}
              alt="Foto inspeksi"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/warehouse/inspections"
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
              Detail Inspeksi
            </h1>
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Informasi lengkap hasil inspeksi kendaraan
            </p>
          </div>
        </div>

        {/* Status & Type badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${currentStatus.cls}`}>
            {currentStatus.icon} {currentStatus.label}
          </span>
          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${currentType.cls}`}>
            {currentType.label}
          </span>
          {currentResult && (
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${currentResult.cls}`}>
              {currentResult.label}
            </span>
          )}
        </div>
      </div>

      {/* Vehicle Info Card */}
      <div className={`${cardClass} p-6`}>
        <div className="flex items-start gap-4 mb-5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-500"
            }`}
          >
            <FiTruck className="text-2xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {insp.warehouseVehicle
                ? `${insp.warehouseVehicle.brandName} ${insp.warehouseVehicle.modelName}`
                : "Kendaraan"}
            </h2>
            {insp.warehouseVehicle && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {insp.warehouseVehicle.year}
                </span>
                <span className={`text-sm font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {insp.warehouseVehicle.licensePlate}
                </span>
                <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {insp.warehouseVehicle.barcode}
                </span>
                {insp.warehouseVehicle.color && (
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {insp.warehouseVehicle.color}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t ${isDark ? "border-slate-700/50" : "border-slate-100"}`}>
          {/* Inspector */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? "bg-slate-700/50 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
              <FiUser size={16} />
            </div>
            <div>
              <p className={`text-[11px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Inspector
              </p>
              <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {insp.inspector?.fullName || insp.inspectorId}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? "bg-slate-700/50 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
              <FiCalendar size={16} />
            </div>
            <div>
              <p className={`text-[11px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Tanggal Inspeksi
              </p>
              <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {formatDate(insp.inspectedAt)}
              </p>
            </div>
          </div>

          {/* Type */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? "bg-slate-700/50 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
              <FiFileText size={16} />
            </div>
            <div>
              <p className={`text-[11px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Tipe Inspeksi
              </p>
              <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {currentType.label}
              </p>
            </div>
          </div>
        </div>

        {/* Repair notes */}
        {insp.repairNotes && (
          <div className={`mt-5 pt-5 border-t ${isDark ? "border-slate-700/50" : "border-slate-100"}`}>
            <div className="flex items-start gap-2">
              <FiAlertTriangle className={`mt-0.5 shrink-0 ${isDark ? "text-orange-400" : "text-orange-500"}`} size={14} />
              <div>
                <p className={`text-xs font-semibold mb-1 ${isDark ? "text-orange-400" : "text-orange-600"}`}>
                  Catatan Perbaikan
                </p>
                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {insp.repairNotes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Score & Stats Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overall Score */}
        <div className={`${cardClass} p-6 flex flex-col items-center justify-center`}>
          <p className={`text-xs font-medium mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Skor Keseluruhan
          </p>
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isDark ? "#334155" : "#e2e8f0"}
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={
                  scorePercent >= 75
                    ? "#10b981"
                    : scorePercent >= 50
                      ? "#f59e0b"
                      : scorePercent >= 25
                        ? "#f97316"
                        : "#ef4444"
                }
                strokeWidth="3"
                strokeDasharray={`${scorePercent}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-2xl font-bold ${
                  scorePercent >= 75
                    ? "text-emerald-500"
                    : scorePercent >= 50
                      ? "text-yellow-500"
                      : scorePercent >= 25
                        ? "text-orange-500"
                        : "text-red-500"
                }`}
              >
                {avgScore.toFixed(1)}
              </span>
              <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                dari 4.0
              </span>
            </div>
          </div>
          <p className={`text-xs mt-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {scoredItems.length} item dinilai dari {totalItems} total
          </p>
        </div>

        {/* Condition Breakdown */}
        <div className={`${cardClass} p-6 lg:col-span-2`}>
          <p className={`text-xs font-medium mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Ringkasan Kondisi
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: "Baik", count: goodCount, color: "text-green-500", bg: isDark ? "bg-green-500/10" : "bg-green-50" },
              { label: "Cukup", count: fairCount, color: "text-yellow-500", bg: isDark ? "bg-yellow-500/10" : "bg-yellow-50" },
              { label: "Kurang", count: poorCount, color: "text-orange-500", bg: isDark ? "bg-orange-500/10" : "bg-orange-50" },
              { label: "Rusak", count: damagedCount, color: "text-red-500", bg: isDark ? "bg-red-500/10" : "bg-red-50" },
              { label: "N/A", count: naCount, color: isDark ? "text-slate-400" : "text-slate-500", bg: isDark ? "bg-slate-700/50" : "bg-slate-50" },
              { label: "Foto", count: totalPhotos, color: "text-teal-500", bg: isDark ? "bg-teal-500/10" : "bg-teal-50", icon: <FiCamera size={12} /> },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
                <p className={`text-[11px] mt-0.5 flex items-center justify-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {"icon" in s && s.icon}
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Condition bar */}
          {totalItems > 0 && (
            <div className="mt-4">
              <div className="flex rounded-full overflow-hidden h-2.5">
                {goodCount > 0 && (
                  <div
                    className="bg-green-500 transition-all"
                    style={{ width: `${(goodCount / totalItems) * 100}%` }}
                    title={`Baik: ${goodCount}`}
                  />
                )}
                {fairCount > 0 && (
                  <div
                    className="bg-yellow-500 transition-all"
                    style={{ width: `${(fairCount / totalItems) * 100}%` }}
                    title={`Cukup: ${fairCount}`}
                  />
                )}
                {poorCount > 0 && (
                  <div
                    className="bg-orange-500 transition-all"
                    style={{ width: `${(poorCount / totalItems) * 100}%` }}
                    title={`Kurang: ${poorCount}`}
                  />
                )}
                {damagedCount > 0 && (
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${(damagedCount / totalItems) * 100}%` }}
                    title={`Rusak: ${damagedCount}`}
                  />
                )}
                {naCount > 0 && (
                  <div
                    className={`transition-all ${isDark ? "bg-slate-600" : "bg-slate-300"}`}
                    style={{ width: `${(naCount / totalItems) * 100}%` }}
                    title={`N/A: ${naCount}`}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {[
                  { label: "Baik", count: goodCount, color: "bg-green-500" },
                  { label: "Cukup", count: fairCount, color: "bg-yellow-500" },
                  { label: "Kurang", count: poorCount, color: "bg-orange-500" },
                  { label: "Rusak", count: damagedCount, color: "bg-red-500" },
                  { label: "N/A", count: naCount, color: isDark ? "bg-slate-600" : "bg-slate-300" },
                ]
                  .filter((l) => l.count > 0)
                  .map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${l.color}`} />
                      <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {l.label} ({l.count})
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inspection Items by Category */}
      <div className="space-y-3">
        <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          Detail Item Inspeksi
        </h2>

        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          const catInfo = CATEGORY_LABELS[category] || { label: category, icon: "📋" };
          const isExpanded = expandedCategories.has(category);
          const catGood = categoryItems.filter((i) => i.condition === "good").length;
          const catFair = categoryItems.filter((i) => i.condition === "fair").length;
          const catPoor = categoryItems.filter((i) => i.condition === "poor").length;
          const catDamaged = categoryItems.filter((i) => i.condition === "damaged").length;
          const catPhotos = categoryItems.reduce((acc, i) => acc + (i.photos?.length || 0), 0);

          return (
            <div key={category} className={`${cardClass} overflow-hidden`}>
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className={`w-full flex items-center gap-3 px-5 py-4 transition-colors ${
                  isDark ? "hover:bg-slate-700/30" : "hover:bg-slate-50"
                }`}
              >
                <span className="text-lg">{catInfo.icon}</span>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {catInfo.label}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {categoryItems.length} item
                    </span>
                    {catPhotos > 0 && (
                      <span className="text-[11px] text-teal-500 flex items-center gap-0.5">
                        <FiCamera size={10} /> {catPhotos}
                      </span>
                    )}
                  </div>
                </div>
                {/* Mini condition indicators */}
                <div className="flex items-center gap-1.5 mr-2">
                  {catGood > 0 && (
                    <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
                      {catGood}
                    </span>
                  )}
                  {catFair > 0 && (
                    <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                      {catFair}
                    </span>
                  )}
                  {catPoor > 0 && (
                    <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">
                      {catPoor}
                    </span>
                  )}
                  {catDamaged > 0 && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
                      {catDamaged}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <FiChevronUp className={`shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                ) : (
                  <FiChevronDown className={`shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                )}
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className={`px-5 pb-4 space-y-2 border-t ${isDark ? "border-slate-700/30" : "border-slate-100"}`}>
                  {categoryItems.map((item) => {
                    const cond = CONDITION_MAP[item.condition] || {
                      label: item.condition,
                      color: "text-gray-500",
                      bg: "bg-gray-100",
                      darkBg: "bg-gray-500/15",
                    };
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border mt-2 ${
                          isDark
                            ? "bg-slate-800/30 border-slate-700/50"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                  isDark
                                    ? "bg-slate-700 text-slate-400"
                                    : "bg-slate-200 text-slate-500"
                                }`}
                              >
                                {item.itemCode}
                              </span>
                              <span
                                className={`text-sm font-medium ${
                                  isDark ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {item.itemName}
                              </span>
                            </div>
                            {item.notes && (
                              <p
                                className={`text-xs mt-1.5 flex items-start gap-1.5 ${
                                  isDark ? "text-slate-400" : "text-slate-500"
                                }`}
                              >
                                <FiInfo size={12} className="mt-0.5 shrink-0" />
                                {item.notes}
                              </p>
                            )}
                          </div>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
                              isDark ? cond.darkBg : cond.bg
                            } ${cond.color}`}
                          >
                            {cond.label}
                          </span>
                        </div>

                        {/* Photos */}
                        {item.photos && item.photos.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-3">
                            {item.photos.map((photo, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedPhoto(photo)}
                                className={`w-16 h-16 rounded-lg overflow-hidden border hover:ring-2 hover:ring-emerald-500 transition-all ${
                                  isDark ? "border-slate-600" : "border-slate-300"
                                }`}
                              >
                                <img
                                  src={getImageUrl(photo)}
                                  alt={`${item.itemName} foto ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Approval Result Section (read-only) */}
      {(insp.status === "approved" || insp.status === "rejected_by_head") && (
        <div
          className={`${cardClass} p-6 ${
            insp.status === "approved"
              ? isDark
                ? "border-emerald-500/30"
                : "border-emerald-200 bg-emerald-50/50"
              : isDark
                ? "border-red-500/30"
                : "border-red-200 bg-red-50/50"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {insp.status === "approved" ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <FiCheckCircle size={20} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center">
                <FiXCircle size={20} />
              </div>
            )}
            <div>
              <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {insp.status === "approved"
                  ? "Inspeksi Disetujui"
                  : "Inspeksi Ditolak"}
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Keputusan review inspeksi
              </p>
            </div>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t ${isDark ? "border-slate-700/30" : "border-slate-200/50"}`}>
            {/* Approver */}
            {insp.approvedBy && (
              <div>
                <p className={`text-[11px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Diputuskan oleh
                </p>
                <p className={`text-sm font-semibold mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                  {insp.approvedBy.fullName}
                </p>
              </div>
            )}

            {/* Date */}
            {insp.approvedAt && (
              <div>
                <p className={`text-[11px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Tanggal Keputusan
                </p>
                <p className={`text-sm font-semibold mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                  {formatDate(insp.approvedAt)}
                </p>
              </div>
            )}

            {/* Overall Result */}
            {insp.overallResult && (
              <div>
                <p className={`text-[11px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Hasil Keputusan
                </p>
                <span
                  className={`inline-block mt-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                    resultConfig[insp.overallResult]?.cls || "bg-slate-500/15 text-slate-400"
                  }`}
                >
                  {resultConfig[insp.overallResult]?.label ||
                    insp.overallResult.replace(/_/g, " ")}
                </span>
              </div>
            )}
          </div>

          {/* Approval Notes */}
          {insp.approvalNotes && (
            <div className={`mt-4 pt-4 border-t ${isDark ? "border-slate-700/30" : "border-slate-200/50"}`}>
              <p className={`text-[11px] font-medium mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Catatan
              </p>
              <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {insp.approvalNotes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Created/Updated timestamps */}
      <div className={`flex flex-wrap items-center gap-x-6 gap-y-1 px-2 pb-4 text-[11px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
        <span>Dibuat: {formatDate(insp.createdAt)}</span>
        <span>Diperbarui: {formatDate(insp.updatedAt)}</span>
      </div>
    </div>
  );
};

export default InspectionDetailView;
