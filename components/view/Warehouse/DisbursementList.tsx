"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/state/store";
import {
  fetchAllDisbursements,
  createDisbursement,
  payDisbursementDp,
  settleDisbursement,
  cancelDisbursement,
  DisbursementWithDetails,
  CreateDisbursementData,
  fetchVehicles,
  clearSuccess,
  clearError,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import Link from "next/link";
import {
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiUser,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiHash,
  FiExternalLink,
  FiPlus,
  FiX,
  FiPercent,
  FiArrowRight,
  FiTrash2,
} from "react-icons/fi";
import { TbCar, TbCashBanknote } from "react-icons/tb";
import { useTheme } from "@/context/ThemeContext";
import { encryptSlug } from "@/lib/slug/slug";
import { useRouter } from "next/navigation";

// ============================
// STATUS CONFIG
// ============================
const disbursementStatusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: {
    label: "Menunggu DP",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    icon: FiClock,
  },
  dp_paid: {
    label: "DP Dibayar",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: FiArrowRight,
  },
  fully_paid: {
    label: "Lunas",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    icon: FiCheckCircle,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    icon: FiXCircle,
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

const getDaysRemaining = (deadline: string) => {
  const now = new Date();
  const dl = new Date(deadline);
  const diff = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

// ============================
// MAIN
// ============================
const DisbursementList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    disbursements,
    vehicles,
    selectedShowroom,
    loading,
    actionLoading,
    disbursementPagination,
    successMessage,
    error,
  } = useSelector((state: RootState) => state.warehouse);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDpModal, setShowDpModal] = useState<DisbursementWithDetails | null>(null);
  const [showSettleModal, setShowSettleModal] = useState<DisbursementWithDetails | null>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL_IMAGES ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
    "http://localhost:8081";
  const getImageUrl = (url: string) =>
    url?.startsWith("http") ? url : baseUrl + url;

  const loadDisbursements = useCallback(() => {
    const params: Record<string, unknown> = {
      page: currentPage,
      perPage: 10,
    };
    if (selectedShowroom?.id) params.showroomId = selectedShowroom.id;
    if (statusFilter !== "all") params.status = statusFilter;
    dispatch(fetchAllDisbursements(params));
  }, [dispatch, selectedShowroom, statusFilter, currentPage]);

  useEffect(() => {
    loadDisbursements();
  }, [loadDisbursements]);

  useEffect(() => {
    if (selectedShowroom?.id) {
      dispatch(
        fetchVehicles({
          showroomId: selectedShowroom.id,
          status: "IN_WAREHOUSE",
        }),
      );
    }
  }, [dispatch, selectedShowroom]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Auto-dismiss success/error
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const totalFullyPaid = disbursements.filter(
    (d) => d.status === "fully_paid",
  ).length;
  const totalDpPaid = disbursements.filter(
    (d) => d.status === "dp_paid",
  ).length;
  const totalPending = disbursements.filter(
    (d) => d.status === "pending",
  ).length;
  const totalDisbursed = disbursements
    .filter((d) => d.status === "fully_paid")
    .reduce((sum, d) => sum + Number(d.finalAmount), 0);

  const filterTabs = [
    { key: "all", label: "Semua", count: disbursementPagination.total },
    { key: "pending", label: "Menunggu DP", count: totalPending },
    { key: "dp_paid", label: "DP Dibayar", count: totalDpPaid },
    { key: "fully_paid", label: "Lunas", count: totalFullyPaid },
    { key: "cancelled", label: "Dibatalkan", count: null },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full">
      {/* TOAST */}
      {successMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2">
          <FiCheckCircle className="shrink-0" /> {successMessage}
        </div>
      )}
      {error && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2">
          <FiXCircle className="shrink-0" /> {error}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1
            className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Pencairan Dana
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Kelola pencairan dana ke penjual
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <FiPlus size={16} />
          Buat Pencairan
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard
          isDark={isDark}
          label="Total Pencairan"
          value={String(disbursementPagination.total || disbursements.length)}
          subtitle="transaksi"
          icon={FiFileText}
          color="blue"
        />
        <SummaryCard
          isDark={isDark}
          label="Sudah Lunas"
          value={String(totalFullyPaid)}
          subtitle="transaksi"
          icon={FiCheckCircle}
          color="emerald"
        />
        <SummaryCard
          isDark={isDark}
          label="Menunggu Pelunasan"
          value={String(totalDpPaid + totalPending)}
          subtitle="transaksi"
          icon={FiClock}
          color="amber"
        />
        <SummaryCard
          isDark={isDark}
          label="Total Dicairkan"
          value={formatPrice(totalDisbursed)}
          subtitle="dana ke penjual"
          icon={TbCashBanknote}
          color="purple"
        />
      </div>

      {/* DISBURSEMENT LIST */}
      <div
        className={`rounded-2xl border overflow-hidden ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"}`}
      >
        {/* Filter Tabs */}
        <div
          className={`px-3 sm:px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b ${isDark ? "border-slate-700/50" : "border-slate-200"}`}
        >
          <div className="flex items-center gap-1 overflow-x-auto min-w-0 w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === tab.key
                    ? "bg-blue-600 text-white shadow-sm"
                    : isDark
                      ? "text-slate-400 hover:text-white hover:bg-slate-700"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab.label}
                {tab.count != null && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${statusFilter === tab.key ? "bg-white/20" : isDark ? "bg-slate-700" : "bg-slate-200/80"}`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={loadDisbursements}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isDark ? "bg-slate-700 hover:bg-slate-600 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={12} />
            Refresh
          </button>
        </div>

        {/* Cards */}
        <div className="p-3 sm:p-4">
          {loading && disbursements.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
                <p
                  className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  Memuat data pencairan...
                </p>
              </div>
            </div>
          ) : disbursements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
              >
                <TbCashBanknote
                  className={`text-2xl ${isDark ? "text-slate-600" : "text-slate-300"}`}
                />
              </div>
              <p
                className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                {statusFilter === "all"
                  ? "Belum ada data pencairan dana"
                  : `Tidak ada pencairan dengan status "${disbursementStatusConfig[statusFilter]?.label || statusFilter}"`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {disbursements.map((disbursement) => (
                <DisbursementCard
                  key={disbursement.id}
                  disbursement={disbursement}
                  isDark={isDark}
                  getImageUrl={getImageUrl}
                  onPayDp={() => setShowDpModal(disbursement)}
                  onSettle={() => setShowSettleModal(disbursement)}
                  onCancel={() => {
                    if (confirm("Yakin ingin membatalkan pencairan dana ini?")) {
                      dispatch(cancelDisbursement(disbursement.id)).then(() =>
                        loadDisbursements(),
                      );
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {disbursementPagination.totalPages > 1 && (
          <div
            className={`px-3 sm:px-5 py-3 flex items-center justify-between border-t ${isDark ? "border-slate-700/50" : "border-slate-200"}`}
          >
            <p
              className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              Halaman {currentPage} dari {disbursementPagination.totalPages}{" "}
              &bull; {disbursementPagination.total} total
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
              >
                <FiChevronLeft size={16} />
              </button>
              {Array.from({
                length: Math.min(5, disbursementPagination.totalPages),
              }).map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentPage === page ? "bg-blue-600 text-white" : isDark ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100"}`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(disbursementPagination.totalPages, p + 1),
                  )
                }
                disabled={currentPage >= disbursementPagination.totalPages}
                className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${isDark ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <CreateDisbursementModal
          isDark={isDark}
          vehicles={vehicles}
          actionLoading={actionLoading}
          getImageUrl={getImageUrl}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => {
            dispatch(createDisbursement(data)).then((res) => {
              if (res.meta.requestStatus === "fulfilled") {
                setShowCreateModal(false);
                loadDisbursements();
              }
            });
          }}
        />
      )}

      {/* PAY DP MODAL */}
      {showDpModal && (
        <PayDpModal
          isDark={isDark}
          disbursement={showDpModal}
          actionLoading={actionLoading}
          onClose={() => setShowDpModal(null)}
          onSubmit={(dpAmount, paymentMethod, notes) => {
            dispatch(
              payDisbursementDp({
                disbursementId: showDpModal.id,
                data: { dpAmount, paymentMethod, notes },
              }),
            ).then((res) => {
              if (res.meta.requestStatus === "fulfilled") {
                setShowDpModal(null);
                loadDisbursements();
              }
            });
          }}
        />
      )}

      {/* SETTLE MODAL */}
      {showSettleModal && (
        <SettleModal
          isDark={isDark}
          disbursement={showSettleModal}
          actionLoading={actionLoading}
          onClose={() => setShowSettleModal(null)}
          onSubmit={(paymentMethod, notes) => {
            dispatch(
              settleDisbursement({
                disbursementId: showSettleModal.id,
                data: { paymentMethod, notes },
              }),
            ).then((res) => {
              if (res.meta.requestStatus === "fulfilled") {
                setShowSettleModal(null);
                loadDisbursements();
              }
            });
          }}
        />
      )}
    </div>
  );
};

// ============================
// SUMMARY CARD
// ============================
const SummaryCard = ({
  isDark,
  label,
  value,
  icon: Icon,
  color,
}: {
  isDark: boolean;
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: "blue" | "emerald" | "amber" | "purple";
}) => {
  const colors = {
    blue: {
      iconBg: isDark ? "bg-blue-500/15" : "bg-blue-50",
      iconColor: "text-blue-500",
      border: isDark ? "border-blue-500/20" : "border-blue-100",
    },
    emerald: {
      iconBg: isDark ? "bg-emerald-500/15" : "bg-emerald-50",
      iconColor: "text-emerald-500",
      border: isDark ? "border-emerald-500/20" : "border-emerald-100",
    },
    amber: {
      iconBg: isDark ? "bg-amber-500/15" : "bg-amber-50",
      iconColor: "text-amber-500",
      border: isDark ? "border-amber-500/20" : "border-amber-100",
    },
    purple: {
      iconBg: isDark ? "bg-purple-500/15" : "bg-purple-50",
      iconColor: "text-purple-500",
      border: isDark ? "border-purple-500/20" : "border-purple-100",
    },
  };
  const c = colors[color];

  return (
    <div
      className={`p-3 sm:p-4 rounded-2xl border ${c.border} ${isDark ? "bg-slate-800/50" : "bg-white shadow-sm"}`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg}`}
        >
          <Icon className={`text-base sm:text-lg ${c.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`text-[10px] sm:text-[11px] font-medium leading-tight ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            {label}
          </p>
          <p
            className={`text-base sm:text-lg font-black leading-tight truncate ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================
// DISBURSEMENT CARD
// ============================
const DisbursementCard = ({
  disbursement,
  isDark,
  getImageUrl,
  onPayDp,
  onSettle,
  onCancel,
}: {
  disbursement: DisbursementWithDetails;
  isDark: boolean;
  getImageUrl: (url: string) => string;
  onPayDp: () => void;
  onSettle: () => void;
  onCancel: () => void;
}) => {
  const router = useRouter();
  const sc =
    disbursementStatusConfig[disbursement.status] ||
    disbursementStatusConfig.pending;
  const StatusIcon = sc.icon;
  const v = disbursement.vehicle;
  const daysRemaining = disbursement.paymentDeadline
    ? getDaysRemaining(disbursement.paymentDeadline)
    : null;

  return (
    <div
      onClick={() =>
        router.push(
          `/warehouse/disbursements/${encryptSlug(disbursement.id)}`,
        )
      }
      className={`rounded-xl border overflow-hidden transition-all hover:shadow-md cursor-pointer ${isDark ? "bg-slate-800/30 border-slate-700/50 hover:border-slate-600" : "bg-white border-slate-200 hover:border-slate-300"}`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        {v && (
          <div className="hidden sm:block sm:w-36 shrink-0">
            <div
              className={`h-full ${isDark ? "bg-slate-900" : "bg-slate-100"}`}
            >
              {v.images?.[0] ? (
                <img
                  src={getImageUrl(v.images[0])}
                  alt={`${v.brandName} ${v.modelName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center py-6">
                  <TbCar
                    className={`text-3xl ${isDark ? "text-slate-700" : "text-slate-300"}`}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`font-mono text-xs px-2 py-0.5 rounded-md border ${isDark ? "bg-slate-800 border-slate-700 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-700"}`}
                >
                  <FiHash className="inline -mt-0.5 mr-0.5" size={10} />
                  {disbursement.invoiceNumber}
                </span>
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${sc.bg} ${sc.color}`}
                >
                  <StatusIcon size={12} />
                  {sc.label}
                </span>
                {daysRemaining !== null && disbursement.status === "dp_paid" && (
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                      daysRemaining <= 3
                        ? "bg-red-500/10 border-red-500/30 text-red-500"
                        : daysRemaining <= 7
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                          : "bg-blue-500/10 border-blue-500/30 text-blue-500"
                    }`}
                  >
                    <FiClock size={10} />
                    {daysRemaining > 0
                      ? `${daysRemaining} hari lagi`
                      : "Jatuh tempo!"}
                  </span>
                )}
              </div>
              {v && (
                <Link
                  href={`/warehouse/vehicles/${encryptSlug(v.id)}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`text-sm font-bold hover:underline ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  {v.brandName} {v.modelName} {v.year}
                </Link>
              )}
              {v && (
                <p
                  className={`text-xs truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  {v.licensePlate} &bull; {v.color} &bull; {v.barcode}
                </p>
              )}
            </div>
            <div className="sm:text-right shrink-0">
              <div className="flex items-center sm:justify-end gap-1 mb-0.5">
                <p
                  className={`text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  Pencairan Final
                </p>
                <FiExternalLink
                  size={10}
                  className={isDark ? "text-slate-600" : "text-slate-300"}
                />
              </div>
              <p
                className={`text-base sm:text-lg font-black ${
                  disbursement.status === "fully_paid"
                    ? "text-emerald-500"
                    : isDark
                      ? "text-white"
                      : "text-slate-900"
                }`}
              >
                {formatPrice(disbursement.finalAmount)}
              </p>
              {Number(disbursement.totalDeduction) > 0 && (
                <p className="text-[10px] text-red-400 font-medium">
                  Potongan: -{formatPrice(disbursement.totalDeduction)}
                </p>
              )}
            </div>
          </div>

          {/* Price breakdown */}
          <div
            className={`grid grid-cols-2 sm:flex sm:flex-wrap gap-x-3 gap-y-1 mb-3 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            <span className="flex items-center gap-1 truncate">
              <FiDollarSign size={11} className="shrink-0" />
              <span className="truncate">Penawaran: {formatPrice(disbursement.offerPrice)}</span>
            </span>
            <span className="flex items-center gap-1 truncate">
              <TbCashBanknote size={12} className="shrink-0" />
              <span className="truncate">DP: {formatPrice(disbursement.dpAmount)}</span>
            </span>
            <span
              className={`flex items-center gap-1 truncate ${
                Number(disbursement.remainingAmount) > 0
                  ? "text-amber-500 font-semibold"
                  : "text-emerald-500"
              }`}
            >
              <FiArrowRight size={11} className="shrink-0" />
              <span className="truncate">Sisa:{" "}
              {Number(disbursement.remainingAmount) > 0
                ? formatPrice(disbursement.remainingAmount)
                : "Lunas"}</span>
            </span>
            <span className="flex items-center gap-1">
              <FiClock size={11} className="shrink-0" />
              Tempo: {disbursement.tempodays} hari
            </span>
          </div>

          {/* Deductions list */}
          {disbursement.deductions && disbursement.deductions.length > 0 && (
            <div
              className={`mb-3 p-2.5 rounded-lg border ${isDark ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-200"}`}
            >
              <p
                className={`text-[10px] font-bold mb-1.5 ${isDark ? "text-red-400" : "text-red-600"}`}
              >
                <FiPercent className="inline -mt-0.5 mr-1" size={10} />
                Potongan Inspeksi ({disbursement.deductions.length} item)
              </p>
              <div className="space-y-1">
                {disbursement.deductions.map((ded, i) => (
                  <div
                    key={ded.id || i}
                    className={`flex justify-between gap-2 text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    <span className="truncate">{ded.description}</span>
                    <span className="font-mono text-red-400 shrink-0 whitespace-nowrap">
                      -{formatPrice(ded.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta info */}
          <div
            className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            <span className="flex items-center gap-1">
              <FiCalendar size={11} />
              {formatDateTime(disbursement.createdAt)}
            </span>
            {disbursement.seller && (
              <span className="flex items-center gap-1">
                <FiUser size={11} />
                Penjual: {disbursement.seller.fullName}
              </span>
            )}
            {v?.sellerName && !disbursement.seller && (
              <span className="flex items-center gap-1">
                <FiUser size={11} />
                Penjual: {v.sellerName}
              </span>
            )}
            {disbursement.dpPaidAt && (
              <span className="flex items-center gap-1 text-blue-500">
                <FiCheckCircle size={11} />
                DP: {formatDateTime(disbursement.dpPaidAt)}
              </span>
            )}
            {disbursement.fullyPaidAt && (
              <span className="flex items-center gap-1 text-emerald-500">
                <FiCheckCircle size={11} />
                Lunas: {formatDateTime(disbursement.fullyPaidAt)}
              </span>
            )}
            {disbursement.paymentDeadline &&
              disbursement.status === "dp_paid" && (
                <span className="flex items-center gap-1">
                  <FiClock size={11} />
                  Batas: {formatDate(disbursement.paymentDeadline)}
                </span>
              )}
          </div>

          {/* Action buttons */}
          {(disbursement.status === "pending" ||
            disbursement.status === "dp_paid") && (
            <div
              className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              {disbursement.status === "pending" && (
                <button
                  onClick={onPayDp}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <TbCashBanknote size={14} />
                  Bayar DP
                </button>
              )}
              {disbursement.status === "dp_paid" && (
                <button
                  onClick={onSettle}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <FiCheckCircle size={14} />
                  Lunasi Sisa
                </button>
              )}
              <button
                onClick={onCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-semibold transition-colors"
              >
                <FiXCircle size={14} />
                Batalkan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================
// CREATE DISBURSEMENT MODAL
// ============================
const CreateDisbursementModal = ({
  isDark,
  vehicles,
  actionLoading,
  getImageUrl,
  onClose,
  onSubmit,
}: {
  isDark: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vehicles: any[];
  actionLoading: boolean;
  getImageUrl: (url: string) => string;
  onClose: () => void;
  onSubmit: (data: CreateDisbursementData) => void;
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [tempoDays, setTempoDays] = useState(15);
  const [notes, setNotes] = useState("");
  const [deductions, setDeductions] = useState<
    { description: string; category: string; amount: number; notes: string }[]
  >([]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const totalDeduction = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
  const finalAmount = selectedVehicle
    ? Number(selectedVehicle.askingPrice) - totalDeduction
    : 0;

  const addDeduction = () => {
    setDeductions([
      ...deductions,
      { description: "", category: "", amount: 0, notes: "" },
    ]);
  };

  const removeDeduction = (index: number) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  const updateDeduction = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const updated = [...deductions];
    updated[index] = { ...updated[index], [field]: value };
    setDeductions(updated);
  };

  const handleSubmit = () => {
    if (!selectedVehicleId) return;
    onSubmit({
      warehouseVehicleId: selectedVehicleId,
      tempoDays,
      deductions: deductions.filter((d) => d.description && d.amount > 0),
      notes: notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4">
      <div
        className={`w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"} shadow-2xl`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}
        >
          <h2
            className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Buat Pencairan Dana
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Vehicle Selection */}
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Pilih Kendaraan
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
            >
              <option value="">-- Pilih kendaraan --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brandName} {v.modelName} {v.year} - {v.licensePlate} (
                  {new Intl.NumberFormat("id-ID").format(v.askingPrice)})
                </option>
              ))}
            </select>
          </div>

          {/* Selected vehicle info */}
          {selectedVehicle && (
            <div
              className={`p-4 rounded-xl border ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
                >
                  {selectedVehicle.images?.[0] ? (
                    <img
                      src={getImageUrl(selectedVehicle.images[0])}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <TbCar className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {selectedVehicle.brandName} {selectedVehicle.modelName}{" "}
                    {selectedVehicle.year}
                  </p>
                  <p
                    className={`text-xs truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {selectedVehicle.licensePlate} &bull;{" "}
                    {selectedVehicle.sellerName}
                  </p>
                </div>
                <div className="sm:ml-auto sm:text-right">
                  <p className="text-[10px] text-slate-400">Harga Penawaran</p>
                  <p
                    className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {formatPrice(selectedVehicle.askingPrice)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tempo */}
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Tempo Pelunasan (hari, max 15)
            </label>
            <input
              type="number"
              min={1}
              max={15}
              value={tempoDays}
              onChange={(e) =>
                setTempoDays(Math.min(15, Math.max(1, Number(e.target.value))))
              }
              className={`w-full px-4 py-2.5 rounded-xl border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
            />
          </div>

          {/* Deductions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Potongan Inspeksi
              </label>
              <button
                onClick={addDeduction}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-semibold transition-colors"
              >
                <FiPlus size={12} />
                Tambah Potongan
              </button>
            </div>

            {deductions.length === 0 && (
              <p
                className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                Tidak ada potongan. Pencairan sesuai harga penawaran.
              </p>
            )}

            <div className="space-y-3">
              {deductions.map((ded, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Deskripsi (misal: Perbaikan kaki-kaki)"
                        value={ded.description}
                        onChange={(e) =>
                          updateDeduction(i, "description", e.target.value)
                        }
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                      />
                      <div className="flex gap-2">
                        <select
                          value={ded.category}
                          onChange={(e) =>
                            updateDeduction(i, "category", e.target.value)
                          }
                          className={`flex-1 px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                        >
                          <option value="">Kategori</option>
                          <option value="exterior">Eksterior</option>
                          <option value="interior">Interior</option>
                          <option value="engine">Mesin</option>
                          <option value="electrical">Kelistrikan</option>
                          <option value="chassis">Sasis/Kaki-kaki</option>
                          <option value="documents">Dokumen</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Jumlah (Rp)"
                          value={ded.amount || ""}
                          onChange={(e) =>
                            updateDeduction(
                              i,
                              "amount",
                              Number(e.target.value) || 0,
                            )
                          }
                          className={`flex-1 px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeDeduction(i)}
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Catatan (opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm resize-none ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
              placeholder="Catatan tambahan..."
            />
          </div>

          {/* Summary */}
          {selectedVehicle && (
            <div
              className={`p-4 rounded-xl border-2 ${isDark ? "bg-slate-800 border-blue-500/30" : "bg-blue-50 border-blue-200"}`}
            >
              <p
                className={`text-xs font-bold mb-3 ${isDark ? "text-blue-400" : "text-blue-700"}`}
              >
                Ringkasan Pencairan
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span
                    className={isDark ? "text-slate-400" : "text-slate-600"}
                  >
                    Harga Penawaran
                  </span>
                  <span
                    className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {formatPrice(selectedVehicle.askingPrice)}
                  </span>
                </div>
                {totalDeduction > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Total Potongan</span>
                    <span className="font-bold">
                      -{formatPrice(totalDeduction)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex justify-between pt-2 border-t ${isDark ? "border-slate-700" : "border-blue-200"}`}
                >
                  <span className="font-bold text-blue-500">
                    Pencairan Final
                  </span>
                  <span
                    className={`text-lg font-black ${finalAmount > 0 ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {formatPrice(Math.max(0, finalAmount))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`sticky bottom-0 flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedVehicleId || finalAmount <= 0 || actionLoading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {actionLoading ? "Memproses..." : "Buat Pencairan"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================
// PAY DP MODAL
// ============================
const PayDpModal = ({
  isDark,
  disbursement,
  actionLoading,
  onClose,
  onSubmit,
}: {
  isDark: boolean;
  disbursement: DisbursementWithDetails;
  actionLoading: boolean;
  onClose: () => void;
  onSubmit: (dpAmount: number, paymentMethod: string, notes: string) => void;
}) => {
  const [dpAmount, setDpAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("transfer_bank");
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4">
      <div
        className={`w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"} shadow-2xl`}
      >
        <div
          className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}
        >
          <h2
            className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Bayar DP Pencairan
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Info */}
          <div
            className={`p-3 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}
          >
            <p
              className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {disbursement.invoiceNumber}
            </p>
            <p
              className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Pencairan Final: {formatPrice(disbursement.finalAmount)}
            </p>
          </div>

          {/* DP Amount */}
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Jumlah DP (Rp)
            </label>
            <input
              type="number"
              min={0}
              max={Number(disbursement.finalAmount)}
              value={dpAmount || ""}
              onChange={(e) => setDpAmount(Number(e.target.value) || 0)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
              placeholder="Masukkan jumlah DP"
            />
            <p
              className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              Sisa setelah DP:{" "}
              {formatPrice(
                Math.max(0, Number(disbursement.finalAmount) - dpAmount),
              )}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Metode Pembayaran
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
            >
              <option value="transfer_bank">Transfer Bank</option>
              <option value="cash">Tunai</option>
              <option value="ewallet">E-Wallet</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Catatan (opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
              placeholder="Catatan DP..."
            />
          </div>
        </div>

        <div
          className={`flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Batal
          </button>
          <button
            onClick={() => onSubmit(dpAmount, paymentMethod, notes)}
            disabled={dpAmount <= 0 || actionLoading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {actionLoading ? "Memproses..." : "Bayar DP"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================
// SETTLE MODAL
// ============================
const SettleModal = ({
  isDark,
  disbursement,
  actionLoading,
  onClose,
  onSubmit,
}: {
  isDark: boolean;
  disbursement: DisbursementWithDetails;
  actionLoading: boolean;
  onClose: () => void;
  onSubmit: (paymentMethod: string, notes: string) => void;
}) => {
  const [paymentMethod, setPaymentMethod] = useState("transfer_bank");
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4">
      <div
        className={`w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"} shadow-2xl`}
      >
        <div
          className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}
        >
          <h2
            className={`text-base sm:text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Pelunasan Sisa Pencairan
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Info */}
          <div
            className={`p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-slate-50"}`}
          >
            <p
              className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {disbursement.invoiceNumber}
            </p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className={isDark ? "text-slate-400" : "text-slate-600"}>
                  Pencairan Final
                </span>
                <span
                  className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  {formatPrice(disbursement.finalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? "text-slate-400" : "text-slate-600"}>
                  DP Sudah Dibayar
                </span>
                <span className="font-bold text-blue-500">
                  -{formatPrice(disbursement.dpAmount)}
                </span>
              </div>
              <div
                className={`flex justify-between pt-2 border-t font-bold ${isDark ? "border-slate-700" : "border-slate-200"}`}
              >
                <span className="text-emerald-500">Sisa Yang Harus Dilunasi</span>
                <span className="text-lg text-emerald-500">
                  {formatPrice(disbursement.remainingAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Metode Pembayaran
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
            >
              <option value="transfer_bank">Transfer Bank</option>
              <option value="cash">Tunai</option>
              <option value="ewallet">E-Wallet</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Catatan (opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
              placeholder="Catatan pelunasan..."
            />
          </div>
        </div>

        <div
          className={`flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Batal
          </button>
          <button
            onClick={() => onSubmit(paymentMethod, notes)}
            disabled={actionLoading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {actionLoading
              ? "Memproses..."
              : `Lunasi ${formatPrice(disbursement.remainingAmount)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisbursementList;
