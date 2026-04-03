"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/state/store";
import {
  fetchInspectionDetail,
  approveInspection,
  rejectInspection,
  clearError,
  clearSuccess,
  clearSelectedInspection,
  InspectionItem,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiCalendar,
  FiCamera,
  FiFileText,
} from "react-icons/fi";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { CONDITION_OPTIONS } from "./INSPECTION_TEMPLATE";

interface InspectionApprovalViewProps {
  inspectionId: string;
}

const CONDITION_MAP: Record<string, { label: string; color: string; bg: string }> = {};
CONDITION_OPTIONS.forEach((o) => {
  CONDITION_MAP[o.value] = { label: o.label, color: o.color, bg: o.bg };
});

const InspectionApprovalView: React.FC<InspectionApprovalViewProps> = ({
  inspectionId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  const { selectedInspection, actionLoading, loading, error, successMessage } =
    useSelector((state: RootState) => state.warehouse);

  const [approvalResult, setApprovalResult] = useState<
    "accepted_ready" | "accepted_repair" | "rejected"
  >("accepted_ready");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectMode, setRejectMode] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL_IMAGES || "http://localhost:8080";
  const getImageUrl = (url: string) =>
    url?.startsWith("http") ? url : baseUrl + url;

  useEffect(() => {
    dispatch(fetchInspectionDetail(inspectionId));
    return () => {
      dispatch(clearSelectedInspection());
    };
  }, [dispatch, inspectionId]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccess());
      router.push("/warehouse/inspections/pending");
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, router]);

  const handleApprove = () => {
    dispatch(
      approveInspection({
        id: inspectionId,
        data: {
          overallResult: approvalResult,
          approvalNotes: approvalNotes || undefined,
        },
      })
    );
  };

  const handleReject = () => {
    if (!approvalNotes.trim()) {
      toast.error("Catatan wajib diisi saat menolak inspeksi");
      return;
    }
    dispatch(
      rejectInspection({
        id: inspectionId,
        data: { approvalNotes },
      })
    );
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const cardClass = `${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl p-6`;

  if (loading || !selectedInspection) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const insp = selectedInspection;
  const items = insp.items || [];
  const isAlreadyProcessed =
    insp.status === "approved" || insp.status === "rejected_by_head";

  // Group items by category
  const groupedItems: Record<string, InspectionItem[]> = {};
  items.forEach((item) => {
    if (!groupedItems[item.category]) groupedItems[item.category] = [];
    groupedItems[item.category].push(item);
  });

  const categoryLabels: Record<string, string> = {
    exterior: "Eksterior",
    interior: "Interior",
    engine: "Mesin",
    electrical: "Kelistrikan",
    chassis: "Kaki-kaki & Chassis",
    test_drive: "Test Drive",
    documents: "Dokumen",
  };

  // Stats
  const goodCount = items.filter((i) => i.condition === "good").length;
  const fairCount = items.filter((i) => i.condition === "fair").length;
  const poorCount = items.filter((i) => i.condition === "poor").length;
  const damagedCount = items.filter((i) => i.condition === "damaged").length;
  const totalPhotos = items.reduce(
    (acc, i) => acc + (i.photos?.length || 0),
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={getImageUrl(selectedPhoto)}
            alt="Foto inspeksi"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/warehouse/inspections/pending"
            className={`p-2 rounded-xl shrink-0 ${isDark ? "bg-slate-800/50 hover:bg-slate-800 text-slate-400" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
          >
            <FiArrowLeft className="text-xl" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1
              className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Review Inspeksi
            </h1>
            <p
              className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Detail inspeksi untuk approval
            </p>
          </div>
        </div>
        {/* Status badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
            insp.status === "submitted"
              ? "bg-yellow-500/20 text-yellow-500"
              : insp.status === "approved"
                ? "bg-green-500/20 text-green-500"
                : insp.status === "rejected_by_head"
                  ? "bg-red-500/20 text-red-500"
                  : "bg-slate-500/20 text-slate-500"
          }`}
        >
          {insp.status === "submitted"
            ? "Menunggu Approval"
            : insp.status === "approved"
              ? "Approved"
              : insp.status === "rejected_by_head"
                ? "Ditolak"
                : insp.status}
        </span>
      </div>

      {/* Inspection Info Card */}
      <div className={cardClass}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Vehicle */}
          <div>
            <p
              className={`text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Kendaraan
            </p>
            <p
              className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {insp.warehouseVehicle
                ? `${insp.warehouseVehicle.brandName} ${insp.warehouseVehicle.modelName} ${insp.warehouseVehicle.year}`
                : "-"}
            </p>
            {insp.warehouseVehicle && (
              <p
                className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                {insp.warehouseVehicle.licensePlate} &bull;{" "}
                {insp.warehouseVehicle.barcode}
              </p>
            )}
          </div>

          {/* Inspector */}
          <div>
            <p
              className={`text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              <FiUser className="inline mr-1" />
              Inspector
            </p>
            <p
              className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {insp.inspector?.fullName || insp.inspectorId}
            </p>
          </div>

          {/* Type */}
          <div>
            <p
              className={`text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              <FiFileText className="inline mr-1" />
              Tipe Inspeksi
            </p>
            <p
              className={`text-sm font-semibold capitalize ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {insp.inspectionType.replace("_", " ")}
            </p>
          </div>

          {/* Date */}
          <div>
            <p
              className={`text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              <FiCalendar className="inline mr-1" />
              Tanggal Inspeksi
            </p>
            <p
              className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {formatDate(insp.inspectedAt)}
            </p>
          </div>
        </div>

        {insp.repairNotes && (
          <div className="mt-4 pt-4 border-t border-slate-700/30">
            <p
              className={`text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Catatan Perbaikan
            </p>
            <p
              className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              {insp.repairNotes}
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          className={`p-4 rounded-2xl text-center ${isDark ? "bg-slate-800/50 border border-slate-700/50" : "bg-white border border-slate-200 shadow-sm"}`}
        >
          <p className="text-2xl font-bold text-green-500">{goodCount}</p>
          <p
            className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Baik
          </p>
        </div>
        <div
          className={`p-4 rounded-2xl text-center ${isDark ? "bg-slate-800/50 border border-slate-700/50" : "bg-white border border-slate-200 shadow-sm"}`}
        >
          <p className="text-2xl font-bold text-yellow-500">{fairCount}</p>
          <p
            className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Cukup
          </p>
        </div>
        <div
          className={`p-4 rounded-2xl text-center ${isDark ? "bg-slate-800/50 border border-slate-700/50" : "bg-white border border-slate-200 shadow-sm"}`}
        >
          <p className="text-2xl font-bold text-orange-500">{poorCount}</p>
          <p
            className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Kurang
          </p>
        </div>
        <div
          className={`p-4 rounded-2xl text-center ${isDark ? "bg-slate-800/50 border border-slate-700/50" : "bg-white border border-slate-200 shadow-sm"}`}
        >
          <p className="text-2xl font-bold text-red-500">{damagedCount}</p>
          <p
            className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Rusak
          </p>
        </div>
        <div
          className={`p-4 rounded-2xl text-center ${isDark ? "bg-slate-800/50 border border-slate-700/50" : "bg-white border border-slate-200 shadow-sm"}`}
        >
          <p className="text-2xl font-bold text-teal-500">{totalPhotos}</p>
          <p
            className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            <FiCamera className="inline mr-1" />
            Foto
          </p>
        </div>
      </div>

      {/* Inspection Items by Category */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className={cardClass}>
            <h3
              className={`text-base font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {categoryLabels[category] || category}
            </h3>
            <div className="space-y-3">
              {categoryItems.map((item) => {
                const cond = CONDITION_MAP[item.condition] || {
                  label: item.condition,
                  color: "text-gray-500",
                  bg: "bg-gray-100",
                };
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border ${
                      isDark
                        ? "bg-slate-800/30 border-slate-700/50"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDark ? "bg-slate-700 text-slate-400" : "bg-slate-200 text-slate-500"}`}
                          >
                            {item.itemCode}
                          </span>
                          <span
                            className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}
                          >
                            {item.itemName}
                          </span>
                        </div>
                        {item.notes && (
                          <p
                            className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                          >
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cond.bg} ${cond.color}`}
                      >
                        {cond.label}
                      </span>
                    </div>

                    {/* Photos */}
                    {item.photos && item.photos.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {item.photos.map((photo, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedPhoto(photo)}
                            className="w-16 h-16 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 hover:ring-2 hover:ring-emerald-500 transition-all"
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
          </div>
        ))}
      </div>

      {/* Approval Section */}
      {!isAlreadyProcessed && (
        <div
          className={`${cardClass} ${
            isDark
              ? "bg-slate-800/80 border-emerald-500/30"
              : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Keputusan Approval
          </h2>

          {!rejectMode ? (
            <>
              {/* Result selection */}
              <div className="mb-4">
                <p
                  className={`text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Hasil Inspeksi
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    {
                      value: "accepted_ready",
                      label: "Diterima (Ready)",
                      desc: "Kendaraan siap dijual",
                      color: "emerald",
                    },
                    {
                      value: "accepted_repair",
                      label: "Diterima (Perlu Repair)",
                      desc: "Kendaraan perlu perbaikan dulu",
                      color: "orange",
                    },
                    {
                      value: "rejected",
                      label: "Ditolak",
                      desc: "Kendaraan tidak memenuhi standar",
                      color: "red",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setApprovalResult(
                          opt.value as
                            | "accepted_ready"
                            | "accepted_repair"
                            | "rejected"
                        )
                      }
                      className={`flex-1 min-w-[140px] p-3 rounded-xl border-2 text-left transition-all ${
                        approvalResult === opt.value
                          ? opt.color === "emerald"
                            ? "border-emerald-500 bg-emerald-500/10"
                            : opt.color === "orange"
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-red-500 bg-red-500/10"
                          : isDark
                            ? "border-slate-700/50 hover:border-slate-600"
                            : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
                      >
                        {opt.label}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label
                  className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Catatan Approval (opsional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={2}
                  placeholder="Catatan tambahan..."
                  className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"} border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <FiCheckCircle /> Approve
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setRejectMode(true)}
                  className={`px-6 py-3 rounded-xl font-semibold border-2 transition-all ${
                    isDark
                      ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                      : "border-red-300 text-red-600 hover:bg-red-50"
                  }`}
                >
                  <FiXCircle className="inline mr-2" />
                  Tolak / Revisi
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Reject mode */}
              <div className="mb-4">
                <label
                  className={`block text-sm font-medium mb-1.5 ${isDark ? "text-red-400" : "text-red-600"}`}
                >
                  Alasan Penolakan (wajib)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan alasan penolakan atau revisi yang diperlukan..."
                  required
                  className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-700/50 border-red-500/30 text-white placeholder-slate-500" : "bg-white border-red-300 text-slate-900 placeholder-slate-400"} border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRejectMode(false)}
                  className={`px-6 py-3 rounded-xl font-semibold ${
                    isDark
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={actionLoading || !approvalNotes.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <FiXCircle /> Tolak Inspeksi
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Already processed info */}
      {isAlreadyProcessed && (
        <div
          className={`${cardClass} ${
            insp.status === "approved"
              ? isDark
                ? "border-green-500/30"
                : "border-green-200 bg-green-50"
              : isDark
                ? "border-red-500/30"
                : "border-red-200 bg-red-50"
          }`}
        >
          <h3
            className={`text-base font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {insp.status === "approved"
              ? "Inspeksi Disetujui"
              : "Inspeksi Ditolak"}
          </h3>
          {insp.approvedBy && (
            <p
              className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              Oleh: {insp.approvedBy.fullName}
            </p>
          )}
          {insp.approvedAt && (
            <p
              className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {formatDate(insp.approvedAt)}
            </p>
          )}
          {insp.overallResult && (
            <p className="mt-2">
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  insp.overallResult === "accepted_ready"
                    ? "bg-green-500/20 text-green-500"
                    : insp.overallResult === "accepted_repair"
                      ? "bg-orange-500/20 text-orange-500"
                      : "bg-red-500/20 text-red-500"
                }`}
              >
                {insp.overallResult.replace(/_/g, " ")}
              </span>
            </p>
          )}
          {insp.approvalNotes && (
            <p
              className={`text-sm mt-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            >
              {insp.approvalNotes}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default InspectionApprovalView;
