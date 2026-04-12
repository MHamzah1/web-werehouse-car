"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/state/store";
import {
  fetchDisbursementDetail,
  makeDisbursementPayment,
  fetchDisbursementPayments,
  cancelDisbursement,
  DisbursementPayment,
  MakeDisbursementPaymentData,
  clearSuccess,
  clearError,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiHash,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiPercent,
  FiX,
  FiFileText,
  FiAlertTriangle,
} from "react-icons/fi";
import { TbCar, TbCashBanknote } from "react-icons/tb";
import { useTheme } from "@/context/ThemeContext";
import { encryptSlug } from "@/lib/slug/slug";

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
  return Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

// ============================
// MAIN COMPONENT
// ============================
const DisbursementDetail = ({ id }: { id: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { selectedDisbursement: disbursement, loading, actionLoading, successMessage, error } =
    useSelector((state: RootState) => state.warehouse);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL_IMAGES ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
    "http://localhost:8081";
  const getImageUrl = (url: string) =>
    url?.startsWith("http") ? url : baseUrl + url;

  const loadDetail = useCallback(() => {
    if (id) dispatch(fetchDisbursementDetail(id));
  }, [dispatch, id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // Auto-dismiss messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      const t = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      const t = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  if (loading || !disbursement) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className={isDark ? "text-slate-400" : "text-slate-500"}>
            Memuat detail pencairan...
          </p>
        </div>
      </div>
    );
  }

  const sc =
    disbursementStatusConfig[disbursement.status] ||
    disbursementStatusConfig.pending;
  const StatusIcon = sc.icon;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = (disbursement as any).vehicle;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seller = (disbursement as any).seller;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processedBy = (disbursement as any).processedBy;
  const payments: DisbursementPayment[] = disbursement.payments || [];
  const daysRemaining = disbursement.paymentDeadline
    ? getDaysRemaining(disbursement.paymentDeadline)
    : null;

  const handlePayment = async (data: MakeDisbursementPaymentData) => {
    const result = await dispatch(
      makeDisbursementPayment({ disbursementId: disbursement.id, data }),
    );
    if (makeDisbursementPayment.fulfilled.match(result)) {
      setShowPaymentModal(false);
      loadDetail();
    }
  };

  const handleCancel = () => {
    if (confirm("Yakin ingin membatalkan pencairan dana ini?")) {
      dispatch(cancelDisbursement(disbursement.id)).then(() => loadDetail());
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/warehouse/disbursements"
            className={`p-2 rounded-lg transition-colors shrink-0 ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <FiArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1
              className={`text-lg sm:text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Detail Pencairan Dana
            </h1>
            <p
              className={`text-sm truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {disbursement.invoiceNumber}
            </p>
          </div>
        </div>
        <span
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border w-fit ${sc.bg} ${sc.color}`}
        >
          <StatusIcon size={14} />
          {sc.label}
        </span>
      </div>

      {/* Vehicle & Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vehicle info card */}
        <div
          className={`rounded-xl border p-4 lg:col-span-1 ${isDark ? "bg-slate-800/30 border-slate-700/50" : "bg-white border-slate-200"}`}
        >
          {v && (
            <>
              <div
                className={`rounded-lg overflow-hidden mb-3 ${isDark ? "bg-slate-900" : "bg-slate-100"}`}
              >
                {v.images?.[0] ? (
                  <img
                    src={getImageUrl(v.images[0])}
                    alt={`${v.brandName} ${v.modelName}`}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center">
                    <TbCar
                      className={`text-4xl ${isDark ? "text-slate-700" : "text-slate-300"}`}
                    />
                  </div>
                )}
              </div>
              <Link
                href={`/warehouse/vehicles/${encryptSlug(v.id)}`}
                className={`text-sm font-bold hover:underline ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {v.brandName} {v.modelName} {v.year}
              </Link>
              <p
                className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                {v.licensePlate} &bull; {v.color}
              </p>
              {v.barcode && (
                <p
                  className={`text-xs font-mono mt-0.5 ${isDark ? "text-slate-600" : "text-slate-400"}`}
                >
                  {v.barcode}
                </p>
              )}
            </>
          )}

          <div
            className={`mt-3 pt-3 border-t space-y-2 text-xs ${isDark ? "border-slate-700/50 text-slate-400" : "border-slate-200 text-slate-500"}`}
          >
            {seller && (
              <div className="flex items-center gap-1.5">
                <FiUser size={12} />
                <span>Penjual: {seller.fullName}</span>
              </div>
            )}
            {v?.sellerName && !seller && (
              <div className="flex items-center gap-1.5">
                <FiUser size={12} />
                <span>Penjual: {v.sellerName}</span>
              </div>
            )}
            {processedBy && (
              <div className="flex items-center gap-1.5">
                <FiFileText size={12} />
                <span>Diproses: {processedBy.fullName}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FiCalendar size={12} />
              <span>Dibuat: {formatDateTime(disbursement.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Financial summary card */}
        <div
          className={`rounded-xl border p-4 lg:col-span-2 ${isDark ? "bg-slate-800/30 border-slate-700/50" : "bg-white border-slate-200"}`}
        >
          <h2
            className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Ringkasan Keuangan
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div
              className={`rounded-lg p-3 ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}
            >
              <p
                className={`text-[10px] font-medium mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                Harga Penawaran
              </p>
              <p
                className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {formatPrice(disbursement.offerPrice)}
              </p>
            </div>
            <div
              className={`rounded-lg p-3 ${isDark ? "bg-red-500/5" : "bg-red-50"}`}
            >
              <p
                className={`text-[10px] font-medium mb-1 ${isDark ? "text-red-400" : "text-red-500"}`}
              >
                Total Potongan
              </p>
              <p className="text-sm font-bold text-red-500">
                -{formatPrice(disbursement.totalDeduction)}
              </p>
            </div>
            <div
              className={`rounded-lg p-3 ${isDark ? "bg-emerald-500/5" : "bg-emerald-50"}`}
            >
              <p
                className={`text-[10px] font-medium mb-1 ${isDark ? "text-emerald-400" : "text-emerald-500"}`}
              >
                Pencairan Final
              </p>
              <p className="text-sm font-bold text-emerald-500">
                {formatPrice(disbursement.finalAmount)}
              </p>
            </div>
            <div
              className={`rounded-lg p-3 ${isDark ? "bg-blue-500/5" : "bg-blue-50"}`}
            >
              <p
                className={`text-[10px] font-medium mb-1 ${isDark ? "text-blue-400" : "text-blue-500"}`}
              >
                DP Dibayar
              </p>
              <p className="text-sm font-bold text-blue-500">
                {formatPrice(disbursement.dpAmount)}
              </p>
            </div>
            <div
              className={`rounded-lg p-3 ${
                Number(disbursement.remainingAmount) > 0
                  ? isDark
                    ? "bg-amber-500/5"
                    : "bg-amber-50"
                  : isDark
                    ? "bg-emerald-500/5"
                    : "bg-emerald-50"
              }`}
            >
              <p
                className={`text-[10px] font-medium mb-1 ${
                  Number(disbursement.remainingAmount) > 0
                    ? isDark
                      ? "text-amber-400"
                      : "text-amber-500"
                    : isDark
                      ? "text-emerald-400"
                      : "text-emerald-500"
                }`}
              >
                Sisa Pembayaran
              </p>
              <p
                className={`text-sm font-bold ${
                  Number(disbursement.remainingAmount) > 0
                    ? "text-amber-500"
                    : "text-emerald-500"
                }`}
              >
                {Number(disbursement.remainingAmount) > 0
                  ? formatPrice(disbursement.remainingAmount)
                  : "Lunas"}
              </p>
            </div>
            <div
              className={`rounded-lg p-3 ${isDark ? "bg-slate-900/50" : "bg-slate-50"}`}
            >
              <p
                className={`text-[10px] font-medium mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                Tempo
              </p>
              <p
                className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {disbursement.tempodays} hari
              </p>
            </div>
          </div>

          {/* Deadline warning */}
          {daysRemaining !== null && disbursement.status === "dp_paid" && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-semibold ${
                daysRemaining <= 3
                  ? "bg-red-500/10 border-red-500/30 text-red-500"
                  : daysRemaining <= 7
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                    : "bg-blue-500/10 border-blue-500/30 text-blue-500"
              }`}
            >
              <FiClock size={14} />
              {daysRemaining > 0 ? (
                <span>
                  Batas pelunasan: {formatDate(disbursement.paymentDeadline!)} ({daysRemaining} hari lagi)
                </span>
              ) : (
                <span>Sudah jatuh tempo!</span>
              )}
            </div>
          )}

          {/* Timeline dates */}
          <div
            className={`flex flex-wrap gap-3 mt-3 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
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
          </div>

          {/* Action buttons */}
          {(disbursement.status === "pending" ||
            disbursement.status === "dp_paid") && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700/50">
              {disbursement.status === "pending" && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <TbCashBanknote size={14} />
                  Bayar DP
                </button>
              )}
              {disbursement.status === "dp_paid" && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <TbCashBanknote size={14} />
                  Bayar Periode
                </button>
              )}
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-semibold transition-colors"
              >
                <FiXCircle size={14} />
                Batalkan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Deductions Section */}
      {disbursement.deductions && disbursement.deductions.length > 0 && (
        <div
          className={`rounded-xl border p-4 ${isDark ? "bg-slate-800/30 border-slate-700/50" : "bg-white border-slate-200"}`}
        >
          <h2
            className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <FiPercent size={14} className="text-red-500" />
            Potongan Inspeksi ({disbursement.deductions.length} item)
          </h2>
          <div className="space-y-2">
            {disbursement.deductions.map((ded, i) => (
              <div
                key={ded.id || i}
                className={`flex items-center justify-between p-3 rounded-lg ${isDark ? "bg-red-500/5" : "bg-red-50"}`}
              >
                <div>
                  <p
                    className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}
                  >
                    {ded.description}
                  </p>
                  {ded.category && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isDark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"}`}
                    >
                      {ded.category}
                    </span>
                  )}
                  {ded.notes && (
                    <p
                      className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                    >
                      {ded.notes}
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold text-red-500 font-mono">
                  -{formatPrice(ded.amount)}
                </span>
              </div>
            ))}
            <div
              className={`flex items-center justify-between p-3 rounded-lg border-t-2 ${isDark ? "border-red-500/20" : "border-red-200"}`}
            >
              <span
                className={`text-sm font-bold ${isDark ? "text-red-400" : "text-red-600"}`}
              >
                Total Potongan
              </span>
              <span className="text-sm font-bold text-red-500 font-mono">
                -{formatPrice(disbursement.totalDeduction)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Section */}
      <div
        className={`rounded-xl border p-4 ${isDark ? "bg-slate-800/30 border-slate-700/50" : "bg-white border-slate-200"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <TbCashBanknote size={16} className="text-emerald-500" />
            Riwayat Pembayaran ({payments.length} periode)
          </h2>
          {(disbursement.status === "pending" ||
            disbursement.status === "dp_paid") && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors"
            >
              <TbCashBanknote size={12} />
              Bayar
            </button>
          )}
        </div>

        {payments.length === 0 ? (
          <div
            className={`text-center py-8 ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            <TbCashBanknote className="mx-auto text-3xl mb-2 opacity-50" />
            <p className="text-sm">Belum ada pembayaran</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment, index) => (
              <PaymentPeriodCard
                key={payment.id || index}
                payment={payment}
                isDark={isDark}
                isLast={index === payments.length - 1}
              />
            ))}

            {/* Payment summary */}
            <div
              className={`p-3 rounded-lg border-2 ${isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                >
                  Total Dibayar
                </span>
                <span className="text-sm font-bold text-emerald-500 font-mono">
                  {formatPrice(
                    payments.reduce((sum, p) => sum + Number(p.amount), 0),
                  )}
                </span>
              </div>
              {Number(disbursement.remainingAmount) > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <span
                    className={`text-xs ${isDark ? "text-amber-400" : "text-amber-500"}`}
                  >
                    Sisa belum dibayar
                  </span>
                  <span className="text-xs font-bold text-amber-500 font-mono">
                    {formatPrice(disbursement.remainingAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isDark={isDark}
          disbursement={disbursement}
          actionLoading={actionLoading}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handlePayment}
        />
      )}
    </div>
  );
};

// ============================
// PAYMENT PERIOD CARD
// ============================
const PaymentPeriodCard = ({
  payment,
  isDark,
  isLast,
}: {
  payment: DisbursementPayment;
  isDark: boolean;
  isLast: boolean;
}) => {
  const typeLabel: Record<string, string> = {
    dp: "DP (Uang Muka)",
    installment: "Cicilan",
    settlement: "Pelunasan",
  };

  const typeColor: Record<string, string> = {
    dp: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    installment: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    settlement: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  };

  return (
    <div className="flex gap-3">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
            payment.type === "settlement"
              ? "bg-emerald-500 text-white"
              : payment.type === "dp"
                ? "bg-blue-500 text-white"
                : isDark
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-200 text-slate-600"
          }`}
        >
          {payment.periodNumber}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 flex-1 mt-1 ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
          />
        )}
      </div>

      {/* Card content */}
      <div
        className={`flex-1 rounded-lg border p-3 mb-2 ${isDark ? "bg-slate-900/30 border-slate-700/50" : "bg-slate-50 border-slate-200"}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Periode {payment.periodNumber}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${typeColor[payment.type] || typeColor.installment}`}
              >
                {typeLabel[payment.type] || payment.type}
              </span>
            </div>
            <div
              className={`flex flex-wrap items-center gap-3 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              <span className="flex items-center gap-1">
                <FiCalendar size={10} />
                {formatDateTime(payment.paidAt)}
              </span>
              {payment.paymentMethod && (
                <span className="flex items-center gap-1">
                  <FiDollarSign size={10} />
                  {payment.paymentMethod}
                </span>
              )}
              {payment.processedBy && (
                <span className="flex items-center gap-1">
                  <FiUser size={10} />
                  {payment.processedBy.fullName}
                </span>
              )}
            </div>
            {payment.notes && (
              <p
                className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                {payment.notes}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-emerald-500 font-mono">
              {formatPrice(payment.amount)}
            </p>
            <p
              className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              Sisa: {formatPrice(payment.remainingAfter)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================
// PAYMENT MODAL
// ============================
const PaymentModal = ({
  isDark,
  disbursement,
  actionLoading,
  onClose,
  onSubmit,
}: {
  isDark: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  disbursement: any;
  actionLoading: boolean;
  onClose: () => void;
  onSubmit: (data: MakeDisbursementPaymentData) => void;
}) => {
  const [amount, setAmount] = useState("");
  const [percent, setPercent] = useState("");
  const [lastEdited, setLastEdited] = useState<"amount" | "percent">("amount");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState("");

  const remaining = Number(disbursement.remainingAmount) || Number(disbursement.finalAmount);
  const isDP = disbursement.status === "pending";
  const parsedAmount = Number(amount) || 0;
  const parsedPercent = Number(percent) || 0;
  const isValid = parsedAmount > 0 && parsedAmount <= remaining;

  // Saat user ketik nominal → hitung persen otomatis
  const handleAmountChange = (value: string) => {
    setAmount(value);
    setLastEdited("amount");
    const num = Number(value) || 0;
    if (remaining > 0 && num >= 0) {
      const pct = (num / remaining) * 100;
      setPercent(pct > 0 ? pct.toFixed(2).replace(/\.?0+$/, "") : "");
    } else {
      setPercent("");
    }
  };

  // Saat user ketik persen → hitung nominal otomatis
  const handlePercentChange = (value: string) => {
    setPercent(value);
    setLastEdited("percent");
    const pct = Number(value) || 0;
    if (remaining > 0 && pct >= 0) {
      const amt = Math.round((pct / 100) * remaining);
      setAmount(amt > 0 ? String(amt) : "");
    } else {
      setAmount("");
    }
  };

  // Quick percent buttons
  const quickPercents = isDP
    ? [30, 50, 70, 100]
    : [25, 50, 75, 100];

  const handleQuickPercent = (pct: number) => {
    const amt = pct === 100 ? remaining : Math.round((pct / 100) * remaining);
    setPercent(String(pct));
    setAmount(String(amt));
    setLastEdited("percent");
  };

  const handleSubmit = () => {
    if (!isValid) return;
    const data: MakeDisbursementPaymentData = {
      amount: parsedAmount,
      type: isDP ? "dp" : parsedAmount >= remaining ? "settlement" : "installment",
    };
    if (paymentMethod) data.paymentMethod = paymentMethod;
    if (paymentReference) data.paymentReference = paymentReference;
    if (notes) data.notes = notes;
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-md mx-4 rounded-2xl shadow-2xl border overflow-hidden max-h-[90vh] flex flex-col ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between flex-shrink-0 ${isDark ? "border-slate-800" : "border-slate-100"}`}
        >
          <div>
            <h3
              className={`font-bold text-base ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {isDP ? "Bayar DP" : "Bayar Periode"}
            </h3>
            <p
              className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {disbursement.invoiceNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Remaining info */}
          <div
            className={`p-3 rounded-lg ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                {isDP ? "Jumlah pencairan" : "Sisa pembayaran"}
              </span>
              <span
                className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {formatPrice(remaining)}
              </span>
            </div>
          </div>

          {/* Quick percent buttons */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Pilih Cepat
            </label>
            <div className="flex gap-2">
              {quickPercents.map((pct) => {
                const amt = pct === 100 ? remaining : Math.round((pct / 100) * remaining);
                const isActive = String(pct) === percent && lastEdited === "percent";
                return (
                  <button
                    key={pct}
                    onClick={() => handleQuickPercent(pct)}
                    className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      isActive
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : isDark
                          ? "border-slate-700 text-slate-300 hover:border-slate-600"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {pct}%
                    <span className="block text-[10px] opacity-70 mt-0.5">
                      {formatPrice(amt)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount & Percent side by side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Nominal input */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Nominal (Rp) *
              </label>
              <div className="relative">
                <span
                  className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  Rp
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className={`w-full pl-8 pr-2 py-2.5 rounded-lg border text-sm font-mono ${
                    lastEdited === "amount" && parsedAmount > 0
                      ? isDark
                        ? "bg-slate-800 border-emerald-500/50 text-white ring-1 ring-emerald-500/30"
                        : "bg-white border-emerald-400 text-slate-900 ring-1 ring-emerald-400/30"
                      : isDark
                        ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600"
                        : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
            </div>

            {/* Percent input */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Persentase (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={percent}
                  onChange={(e) => handlePercentChange(e.target.value)}
                  placeholder="0"
                  min={0}
                  max={100}
                  step={0.01}
                  className={`w-full pl-3 pr-8 py-2.5 rounded-lg border text-sm font-mono ${
                    lastEdited === "percent" && parsedPercent > 0
                      ? isDark
                        ? "bg-slate-800 border-emerald-500/50 text-white ring-1 ring-emerald-500/30"
                        : "bg-white border-emerald-400 text-slate-900 ring-1 ring-emerald-400/30"
                      : isDark
                        ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600"
                        : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Conversion indicator */}
          {parsedAmount > 0 && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${isDark ? "bg-slate-800/50 text-slate-400" : "bg-slate-50 text-slate-500"}`}
            >
              <FiArrowRight size={12} className="text-emerald-500 flex-shrink-0" />
              <span>
                <span className="font-bold text-emerald-500">{formatPrice(parsedAmount)}</span>
                {" "}={" "}
                <span className="font-bold text-emerald-500">
                  {remaining > 0 ? ((parsedAmount / remaining) * 100).toFixed(2).replace(/\.?0+$/, "") : 0}%
                </span>
                {" "}dari {isDP ? "pencairan" : "sisa"} {formatPrice(remaining)}
              </span>
            </div>
          )}

          {parsedAmount > remaining && (
            <p className="text-red-500 text-[11px] flex items-center gap-1">
              <FiAlertTriangle size={11} />
              Jumlah melebihi sisa pembayaran ({formatPrice(remaining)})
            </p>
          )}

          {/* Payment method */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Metode Pembayaran
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
            >
              <option value="">Pilih metode...</option>
              <option value="transfer_bank">Transfer Bank</option>
              <option value="cash">Tunai</option>
              <option value="e_wallet">E-Wallet</option>
              <option value="check">Cek/Giro</option>
            </select>
          </div>

          {/* Payment reference */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Referensi Pembayaran
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="No. rekening / referensi transfer"
              className={`w-full px-3 py-2.5 rounded-lg border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"}`}
            />
          </div>

          {/* Notes */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Catatan
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Catatan opsional..."
              className={`w-full px-3 py-2.5 rounded-lg border text-sm resize-none ${isDark ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-600" : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"}`}
            />
          </div>

          {/* Summary */}
          {parsedAmount > 0 && parsedAmount <= remaining && (
            <div
              className={`p-3 rounded-lg border ${isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"}`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                  Dibayar ({remaining > 0 ? ((parsedAmount / remaining) * 100).toFixed(1).replace(/\.0$/, "") : 0}%)
                </span>
                <span className="font-bold text-emerald-500">
                  {formatPrice(parsedAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                  Sisa setelah bayar
                </span>
                <span
                  className={`font-bold ${
                    remaining - parsedAmount === 0
                      ? "text-emerald-500"
                      : "text-amber-500"
                  }`}
                >
                  {remaining - parsedAmount === 0
                    ? "Lunas"
                    : formatPrice(remaining - parsedAmount)}
                </span>
              </div>
              {parsedAmount >= remaining && (
                <p className="text-emerald-500 text-[10px] font-semibold mt-1 flex items-center gap-1">
                  <FiCheckCircle size={10} />
                  Pembayaran ini akan melunasi seluruh sisa
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-4 border-t flex gap-2 flex-shrink-0 ${isDark ? "border-slate-800" : "border-slate-100"}`}
        >
          <button
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || actionLoading}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading
              ? "Memproses..."
              : isDP
                ? "Bayar DP"
                : parsedAmount >= remaining
                  ? "Lunasi"
                  : "Bayar Periode"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisbursementDetail;
