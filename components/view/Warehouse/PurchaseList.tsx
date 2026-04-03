"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/state/store";
import {
  fetchPurchasesByShowroom,
  confirmPurchasePayment,
  clearSuccess,
  clearError,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import toast from "react-hot-toast";
import { FiShoppingBag, FiCheck } from "react-icons/fi";
import { useTheme } from "@/context/ThemeContext";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  dp_paid: "bg-blue-500/20 text-blue-400",
  fully_paid: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
  refunded: "bg-slate-500/20 text-slate-400",
};

const PurchaseList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { purchases, selectedShowroom, loading, successMessage, error } =
    useSelector((state: RootState) => state.warehouse);

  useEffect(() => {
    if (selectedShowroom?.id)
      dispatch(fetchPurchasesByShowroom(selectedShowroom.id));
  }, [dispatch, selectedShowroom]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccess());
      if (selectedShowroom?.id)
        dispatch(fetchPurchasesByShowroom(selectedShowroom.id));
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, selectedShowroom]);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Transaksi Pembelian
          </h1>
          <p
            className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Kelola transaksi pembelian kendaraan
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
        </div>
      ) : purchases.length === 0 ? (
        <div
          className={`${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} rounded-2xl p-12 text-center border`}
        >
          <FiShoppingBag className="text-5xl text-slate-500 mx-auto mb-4" />
          <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Belum ada transaksi pembelian
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden">
            <div
              className={`${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl overflow-hidden`}
            >
              <div className={`divide-y ${isDark ? "divide-slate-700/30" : "divide-slate-100"}`}>
                {purchases.map((p) => (
                  <div key={p.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                          {p.buyerName}
                        </p>
                        <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {p.buyerPhone}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${statusColors[p.status] || ""}`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-emerald-400 text-xs">
                        {p.invoiceNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[p.paymentStatus] || ""}`}
                      >
                        {p.paymentStatus}
                      </span>
                      <span className={`text-xs capitalize ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {p.paymentType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                          {formatPrice(p.totalPrice)}
                        </span>
                        <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {formatDate(p.createdAt)}
                        </span>
                      </div>
                      {p.paymentStatus === "pending" && (
                        <button
                          onClick={() => dispatch(confirmPurchasePayment(p.id))}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium transition-colors"
                        >
                          <FiCheck /> Konfirmasi
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div
            className={`hidden md:block ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className={`border-b ${isDark ? "border-slate-700/50" : "border-slate-200"}`}
                  >
                    <th
                      className={`text-left px-4 py-3 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Invoice
                    </th>
                    <th
                      className={`text-left px-4 py-3 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Pembeli
                    </th>
                    <th
                      className={`text-left px-4 py-3 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Total
                    </th>
                    <th
                      className={`text-left px-4 py-3 font-medium hidden lg:table-cell ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Tipe
                    </th>
                    <th
                      className={`text-left px-4 py-3 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Pembayaran
                    </th>
                    <th
                      className={`text-left px-4 py-3 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Status
                    </th>
                    <th
                      className={`text-left px-4 py-3 font-medium hidden lg:table-cell ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Tanggal
                    </th>
                    <th
                      className={`text-center px-4 py-3 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${isDark ? "divide-slate-700/30" : "divide-slate-100"}`}
                >
                  {purchases.map((p) => (
                    <tr
                      key={p.id}
                      className={`transition-colors ${isDark ? "hover:bg-slate-700/20" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-emerald-400 text-xs">
                          {p.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`font-medium text-sm ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                          {p.buyerName}
                        </div>
                        <div
                          className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
                        >
                          {p.buyerPhone}
                        </div>
                      </td>
                      <td
                        className={`px-4 py-3 font-medium ${isDark ? "text-white" : "text-slate-900"}`}
                      >
                        {formatPrice(p.totalPrice)}
                      </td>
                      <td className={`px-4 py-3 capitalize hidden lg:table-cell ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                        {p.paymentType}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[p.paymentStatus] || ""}`}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[p.status] || ""}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-xs hidden lg:table-cell ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.paymentStatus === "pending" && (
                          <button
                            onClick={() => dispatch(confirmPurchasePayment(p.id))}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium transition-colors"
                          >
                            <FiCheck /> Konfirmasi
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PurchaseList;
