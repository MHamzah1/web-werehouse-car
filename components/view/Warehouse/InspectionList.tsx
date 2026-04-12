"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/state/store";
import {
  fetchVehicles,
  fetchInspectionsByVehicle,
  fetchPendingApprovals,
  VehicleInspection,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiPlus,
  FiClipboard,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiChevronRight,
  FiUser,
  FiCalendar,
  FiSearch,
  FiAlertCircle,
  FiTruck,
  FiEye,
  FiFilter,
  FiExternalLink,
} from "react-icons/fi";
import { MdOutlineCarCrash } from "react-icons/md";
import { useTheme } from "@/context/ThemeContext";
import { generateUrlWithEncryptedParams, encryptSlug } from "@/lib/slug/slug";

// ── helpers ──────────────────────────────────────────────────
const formatDate = (d?: string) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateShort = (d?: string) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

type Tab = "queue" | "pending";

// ── Status badge for inspection status ───────────────────────
const InspStatusBadge = ({ status }: { status?: string }) => {
  if (!status) return null;
  const cfg: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    draft:           { label: "Draft",    cls: "bg-slate-500/15 text-slate-400",                       icon: <FiClipboard size={10} /> },
    submitted:       { label: "Menunggu", cls: "bg-yellow-500/15 text-yellow-500",                     icon: <FiClock size={10} /> },
    approved:        { label: "Disetujui",cls: "bg-emerald-500/15 text-emerald-500",                   icon: <FiCheckCircle size={10} /> },
    rejected_by_head:{ label: "Ditolak",  cls: "bg-red-500/15 text-red-500",                           icon: <FiXCircle size={10} /> },
  };
  const c = cfg[status] ?? cfg.draft;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
};

// ── Result badge ─────────────────────────────────────────────
const ResultBadge = ({ result }: { result?: string }) => {
  if (!result) return null;
  const cfg: Record<string, { label: string; cls: string }> = {
    accepted_ready:  { label: "Siap Jual",        cls: "bg-green-500/15 text-green-500" },
    accepted_repair: { label: "Perlu Perbaikan",   cls: "bg-orange-500/15 text-orange-500" },
    rejected:        { label: "Ditolak",           cls: "bg-red-500/15 text-red-500" },
  };
  const c = cfg[result] ?? { label: result.replace(/_/g, " "), cls: "bg-slate-500/15 text-slate-400" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${c.cls}`}>
      {c.label}
    </span>
  );
};

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  icon,
  color,
  isDark,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isDark: boolean;
}) => (
  <div
    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
      isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>
      {icon}
    </div>
    <div>
      <p className={`text-2xl font-bold leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
        {value}
      </p>
      <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────
const InspectionList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { vehicles, inspections, pendingInspections, selectedShowroom, loading } =
    useSelector((state: RootState) => state.warehouse);

  const [tab, setTab] = useState<Tab>("queue");
  const [searchQueue, setSearchQueue] = useState("");
  const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const navigateToDetail = (inspectionId: string) => {
    router.push(generateUrlWithEncryptedParams("/warehouse/inspections/detail", { id: inspectionId }));
  };

  useEffect(() => {
    dispatch(fetchVehicles({ showroomId: selectedShowroom?.id, status: "INSPECTING" }));
    dispatch(fetchPendingApprovals());
  }, [dispatch, selectedShowroom]);

  const handleExpandHistory = async (vehicleId: string) => {
    if (expandedVehicleId === vehicleId) {
      setExpandedVehicleId(null);
      return;
    }
    setExpandedVehicleId(vehicleId);
    setLoadingHistory(true);
    await dispatch(fetchInspectionsByVehicle(vehicleId));
    setLoadingHistory(false);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQueue.toLowerCase();
    return (
      !q ||
      v.brandName?.toLowerCase().includes(q) ||
      v.modelName?.toLowerCase().includes(q) ||
      v.licensePlate?.toLowerCase().includes(q) ||
      v.barcode?.toLowerCase().includes(q)
    );
  });

  const card = `${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl`;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Inspeksi Kendaraan
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Kelola proses inspeksi kendaraan warehouse
          </p>
        </div>
        <div className="flex gap-2">
          {pendingInspections.length > 0 && (
            <Link
              href="/warehouse/inspections/pending"
              className="relative flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 rounded-xl font-semibold text-sm transition-all"
            >
              <FiClock />
              Review
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-yellow-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingInspections.length}
              </span>
            </Link>
          )}
          <Link
            href="/warehouse/inspections/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-emerald-500/30 transition-all"
          >
            <FiPlus /> Inspeksi Baru
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Antrian Inspeksi"
          value={vehicles.length}
          icon={<FiTruck />}
          color="bg-blue-500/15 text-blue-500"
          isDark={isDark}
        />
        <StatCard
          label="Pending Review"
          value={pendingInspections.length}
          icon={<FiClock />}
          color="bg-yellow-500/15 text-yellow-500"
          isDark={isDark}
        />
        <StatCard
          label="Disetujui"
          value={pendingInspections.filter((i) => i.status === "approved").length}
          icon={<FiCheckCircle />}
          color="bg-emerald-500/15 text-emerald-500"
          isDark={isDark}
        />
        <StatCard
          label="Ditolak"
          value={pendingInspections.filter((i) => i.status === "rejected_by_head").length}
          icon={<FiXCircle />}
          color="bg-red-500/15 text-red-500"
          isDark={isDark}
        />
      </div>

      {/* ── Tabs ── */}
      <div className={`flex gap-1 p-1 rounded-xl w-full sm:w-fit overflow-x-auto ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
        {(
          [
            { key: "queue",   label: "Antrian Inspeksi", count: vehicles.length },
            { key: "pending", label: "Pending Review",   count: pendingInspections.length },
          ] as { key: Tab; label: string; count: number }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key
                ? isDark
                  ? "bg-slate-700 text-white shadow"
                  : "bg-white text-slate-900 shadow"
                : isDark
                  ? "text-slate-400 hover:text-slate-300"
                  : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  tab === t.key
                    ? "bg-emerald-500 text-white"
                    : isDark
                      ? "bg-slate-600 text-slate-400"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Antrian Inspeksi ── */}
      {tab === "queue" && (
        <div className={`${card} overflow-hidden`}>
          {/* Search bar */}
          <div className={`px-4 py-3 border-b ${isDark ? "border-slate-700/50" : "border-slate-100"}`}>
            <div className="relative">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`} />
              <input
                type="text"
                value={searchQueue}
                onChange={(e) => setSearchQueue(e.target.value)}
                placeholder="Cari merek, model, plat nomor, atau barcode..."
                className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
              <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>Memuat data...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-16 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              <MdOutlineCarCrash className="text-5xl mb-3 opacity-40" />
              <p className="text-base font-medium">
                {searchQueue ? "Kendaraan tidak ditemukan" : "Tidak ada antrian inspeksi"}
              </p>
              <p className="text-sm mt-1 opacity-70">
                {searchQueue ? "Coba kata kunci lain" : "Semua kendaraan sudah selesai diinspeksi"}
              </p>
            </div>
          ) : (
            <div className={`divide-y ${isDark ? "divide-slate-700/40" : "divide-slate-100"}`}>
              {filteredVehicles.map((v) => {
                const isExpanded = expandedVehicleId === v.id;
                const vehicleInspections = isExpanded ? inspections.filter((i) => i.warehouseVehicleId === v.id) : [];

                return (
                  <div key={v.id}>
                    {/* Vehicle Row */}
                    <div
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-4 transition-colors ${
                        isDark ? "hover:bg-slate-800/60" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        {/* Car icon */}
                        <div
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${
                            isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-500"
                          }`}
                        >
                          <FiTruck className="text-lg sm:text-xl" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                            {v.brandName} {v.modelName}{" "}
                            <span className={`font-normal text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              ({v.year})
                            </span>
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                            <span className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              {v.licensePlate}
                            </span>
                            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                              {v.barcode}
                            </span>
                            {v.color && (
                              <span className={`text-xs hidden sm:inline ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                • {v.color}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] mt-0.5 hidden sm:block ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            <FiCalendar className="inline mr-1" />
                            Terdaftar {formatDateShort(v.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 pl-13 sm:pl-0">
                        <button
                          onClick={() => handleExpandHistory(v.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isExpanded
                              ? isDark
                                ? "bg-slate-600 text-white"
                                : "bg-slate-200 text-slate-900"
                              : isDark
                                ? "bg-slate-700/60 hover:bg-slate-700 text-slate-300"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                          }`}
                        >
                          <FiEye size={12} />
                          Riwayat
                        </button>
                        <Link
                          href={generateUrlWithEncryptedParams("/warehouse/inspections/create", { vehicleId: v.id })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shadow-sm"
                        >
                          <FiClipboard size={12} />
                          Inspeksi
                        </Link>
                      </div>
                    </div>

                    {/* Expanded history */}
                    {isExpanded && (
                      <div className={`px-4 pb-4 pt-0 ${isDark ? "bg-slate-800/30" : "bg-slate-50/70"}`}>
                        {loadingHistory ? (
                          <div className="flex items-center gap-2 py-4 pl-2">
                            <div className="animate-spin h-4 w-4 rounded-full border-2 border-emerald-500 border-t-transparent" />
                            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Memuat riwayat...</span>
                          </div>
                        ) : vehicleInspections.length === 0 ? (
                          <div className={`flex items-center gap-2 py-4 pl-2 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            <FiAlertCircle size={14} />
                            Belum ada riwayat inspeksi untuk kendaraan ini.
                          </div>
                        ) : (
                          <div className="space-y-2 mt-2">
                            {vehicleInspections.map((insp) => (
                              <InspectionHistoryRow key={insp.id} insp={insp} isDark={isDark} onDetail={navigateToDetail} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Pending Review ── */}
      {tab === "pending" && (
        <div className={`${card} overflow-hidden`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-yellow-500 border-t-transparent" />
              <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>Memuat data...</p>
            </div>
          ) : pendingInspections.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-16 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              <FiCheckCircle className="text-5xl mb-3 opacity-40 text-emerald-500" />
              <p className="text-base font-medium">Tidak ada inspeksi pending</p>
              <p className="text-sm mt-1 opacity-70">Semua inspeksi sudah di-review</p>
            </div>
          ) : (
            <div className={`divide-y ${isDark ? "divide-slate-700/40" : "divide-slate-100"}`}>
              {pendingInspections.map((insp) => (
                <Link
                  key={insp.id}
                  href={generateUrlWithEncryptedParams("/warehouse/inspections/review", { id: insp.id })}
                  className={`flex items-center gap-4 px-4 py-4 transition-colors ${
                    isDark ? "hover:bg-slate-800/60" : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
                    <FiClipboard className="text-xl" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                      {insp.warehouseVehicle
                        ? `${insp.warehouseVehicle.brandName} ${insp.warehouseVehicle.modelName} ${insp.warehouseVehicle.year}`
                        : "Kendaraan"}
                    </p>
                    {insp.warehouseVehicle && (
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {insp.warehouseVehicle.licensePlate} · {insp.warehouseVehicle.barcode}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      <span className={`text-[11px] flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        <FiUser size={11} />
                        {insp.inspector?.fullName ?? "Inspector"}
                      </span>
                      <span className={`text-[11px] flex items-center gap-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        <FiCalendar size={11} />
                        {formatDate(insp.inspectedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        isDark ? "bg-teal-500/15 text-teal-400" : "bg-teal-50 text-teal-600"
                      }`}
                    >
                      {insp.inspectionType?.replace(/_/g, " ")}
                    </span>
                    <span className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {insp.items?.length ?? 0} item
                    </span>
                  </div>

                  <FiChevronRight className={`text-lg shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                </Link>
              ))}
            </div>
          )}

          {pendingInspections.length > 0 && (
            <div className={`px-4 py-3 border-t flex justify-end ${isDark ? "border-slate-700/50" : "border-slate-100"}`}>
              <Link
                href="/warehouse/inspections/pending"
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Lihat semua <FiChevronRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Inline history row ────────────────────────────────────────
const InspectionHistoryRow = ({
  insp,
  isDark,
  onDetail,
}: {
  insp: VehicleInspection;
  isDark: boolean;
  onDetail: (id: string) => void;
}) => {
  const isApproved = insp.status === "approved";
  const isRejected = insp.status === "rejected_by_head";

  return (
    <div
      onDoubleClick={() => onDetail(insp.id)}
      className={`flex flex-wrap items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
        isApproved
          ? isDark
            ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
            : "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
          : isRejected
            ? isDark
              ? "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
              : "border-red-200 bg-red-50/50 hover:bg-red-50"
            : isDark
              ? "border-slate-700 bg-slate-800/40 hover:bg-slate-800/60"
              : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      {/* Status dot */}
      <div
        className={`w-2 h-2 rounded-full shrink-0 ${
          isApproved
            ? "bg-emerald-500"
            : isRejected
              ? "bg-red-500"
              : insp.status === "submitted"
                ? "bg-yellow-500 animate-pulse"
                : "bg-slate-400"
        }`}
      />

      {/* Type */}
      <span className={`capitalize font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
        {insp.inspectionType?.replace(/_/g, " ") ?? "-"}
      </span>

      {/* Status */}
      <InspStatusBadge status={insp.status} />

      {/* Result */}
      <ResultBadge result={insp.overallResult} />

      {/* Approver */}
      {insp.approvedBy && (
        <span className={`flex items-center gap-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          <FiUser size={10} />
          {insp.approvedBy.fullName}
        </span>
      )}

      {/* Date */}
      <span className={`${isDark ? "text-slate-500" : "text-slate-400"}`}>
        {formatDateShort(insp.inspectedAt)}
      </span>

      {/* Detail button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDetail(insp.id);
        }}
        className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors ${
          isDark
            ? "bg-slate-700/60 hover:bg-slate-700 text-slate-300"
            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
        }`}
      >
        <FiExternalLink size={10} />
        Detail
      </button>
    </div>
  );
};

export default InspectionList;
