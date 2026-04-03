"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/state/store";
import {
  fetchPendingApprovals,
  clearError,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import {
  FiArrowLeft,
  FiClipboard,
  FiUser,
  FiCalendar,
  FiChevronRight,
} from "react-icons/fi";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { generateUrlWithEncryptedParams } from "@/lib/slug/slug";
import toast from "react-hot-toast";

const PendingApprovalList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { pendingInspections, loading, error } = useSelector(
    (state: RootState) => state.warehouse
  );

  useEffect(() => {
    dispatch(fetchPendingApprovals());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const cardClass = `${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/warehouse/inspections"
            className={`p-2 rounded-xl shrink-0 ${isDark ? "bg-slate-800/50 hover:bg-slate-800 text-slate-400" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
          >
            <FiArrowLeft className="text-xl" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1
              className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Menunggu Approval
            </h1>
            <p
              className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Inspeksi yang menunggu review Kepala Inspeksi
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-bold w-fit ${
            isDark
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {pendingInspections.length} pending
        </span>
      </div>

      {/* List */}
      <div className={`${cardClass} overflow-hidden`}>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        ) : pendingInspections.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center py-16 ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            <FiClipboard className="text-4xl mb-3" />
            <p className="text-base font-medium">Tidak ada inspeksi pending</p>
            <p className="text-sm mt-1">
              Semua inspeksi sudah di-review
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {pendingInspections.map((insp) => (
              <Link
                key={insp.id}
                href={generateUrlWithEncryptedParams(
                  "/warehouse/inspections/review",
                  { id: insp.id }
                )}
                className={`flex items-center gap-4 p-4 sm:p-5 transition-colors ${
                  isDark ? "hover:bg-slate-800/80" : "hover:bg-slate-50"
                }`}
              >
                {/* Vehicle info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {insp.warehouseVehicle
                      ? `${insp.warehouseVehicle.brandName} ${insp.warehouseVehicle.modelName} ${insp.warehouseVehicle.year}`
                      : "Kendaraan"}
                  </p>
                  {insp.warehouseVehicle && (
                    <p
                      className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
                    >
                      {insp.warehouseVehicle.licensePlate} &bull;{" "}
                      {insp.warehouseVehicle.barcode}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span
                      className={`text-xs flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      <FiUser size={12} />
                      {insp.inspector?.fullName || "Inspector"}
                    </span>
                    <span
                      className={`text-xs flex items-center gap-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                    >
                      <FiCalendar size={12} />
                      {formatDate(insp.inspectedAt)}
                    </span>
                  </div>
                </div>

                {/* Inspection type badge */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                    isDark
                      ? "bg-teal-500/20 text-teal-400"
                      : "bg-teal-50 text-teal-600"
                  }`}
                >
                  {insp.inspectionType.replace("_", " ")}
                </span>

                {/* Items count */}
                <span
                  className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  {insp.items?.length || 0} item
                </span>

                <FiChevronRight
                  className={isDark ? "text-slate-500" : "text-slate-400"}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApprovalList;
