"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/state/store";
import {
  createRepairOrder,
  fetchVehicleDetail,
  clearError,
  clearSuccess,
  WarehouseVehicle,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiTruck, FiTool } from "react-icons/fi";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import PaginatedSelectField from "@/components/ui/paginated-select-field";
import CurrencyInputField from "@/components/ui/currency-input-field";
import { decryptQueryParam } from "@/lib/slug/slug";

// helper type for the API items
interface VehicleItem {
  id: string;
  brandName: string;
  modelName: string;
  year: number;
  color: string;
  licensePlate: string;
  barcode: string;
  transmission: string;
  mileage: number;
  askingPrice: string | number;
  sellerName: string;
  status: string;
}

const statusLabels: Record<string, string> = {
  INSPECTING: "Inspeksi",
  REGISTERED: "Terdaftar",
  IN_WAREHOUSE: "Di Gudang",
  IN_REPAIR: "Perbaikan",
  READY: "Siap Jual",
  PUBLISHED: "Marketplace",
  SOLD: "Terjual",
  REJECTED: "Ditolak",
};

const RepairForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleIdFromUrl = decryptQueryParam(searchParams.get("vehicleId"));

  const {
    selectedVehicle,
    selectedShowroom,
    actionLoading,
    error,
    successMessage,
  } = useSelector((state: RootState) => state.warehouse);

  const [form, setForm] = useState({
    warehouseVehicleId: vehicleIdFromUrl,
    repairType: "light" as "light" | "heavy",
    description: "",
    estimatedCost: 0,
  });

  // Store display label + info of the selected vehicle locally
  const [vehicleDisplayLabel, setVehicleDisplayLabel] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState<VehicleItem | null>(null);

  // If vehicleId is from URL, fetch its detail for display
  useEffect(() => {
    if (vehicleIdFromUrl) {
      dispatch(fetchVehicleDetail(vehicleIdFromUrl));
    }
  }, [dispatch, vehicleIdFromUrl]);

  // Once selectedVehicle arrives (from URL fetch), populate display
  useEffect(() => {
    if (
      vehicleIdFromUrl &&
      selectedVehicle &&
      selectedVehicle.id === vehicleIdFromUrl
    ) {
      const v = selectedVehicle;
      setVehicleDisplayLabel(
        `${v.brandName} ${v.modelName} (${v.year}) — ${v.licensePlate}`,
      );
      setVehicleInfo({
        id: v.id,
        brandName: v.brandName,
        modelName: v.modelName,
        year: v.year,
        color: v.color,
        licensePlate: v.licensePlate,
        barcode: v.barcode,
        transmission: v.transmission,
        mileage: v.mileage,
        askingPrice: v.askingPrice,
        sellerName: v.sellerName,
        status: v.status,
      });
    }
  }, [selectedVehicle, vehicleIdFromUrl]);

  // Success / error
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccess());
      router.push(
        vehicleIdFromUrl
          ? `/warehouse/vehicles/${vehicleIdFromUrl}`
          : "/warehouse/repairs",
      );
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, router, vehicleIdFromUrl]);

  // ── Handlers ──────────────────────────────────────────────
  const handleVehicleChange = (_val: string, item: unknown) => {
    const v = item as VehicleItem;
    setForm((f) => ({ ...f, warehouseVehicleId: v.id }));
    setVehicleDisplayLabel(
      `${v.brandName} ${v.modelName} (${v.year}) — ${v.licensePlate}`,
    );
    setVehicleInfo(v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.warehouseVehicleId) {
      toast.error("Pilih kendaraan terlebih dahulu");
      return;
    }
    dispatch(
      createRepairOrder({
        ...form,
        estimatedCost: Number(form.estimatedCost) || undefined,
      }),
    );
  };

  const formatPrice = (n: number | string) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(n));

  // ── Theme helpers ─────────────────────────────────────────
  const cardClass = `${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`;
  const inputClass = `w-full px-4 py-2.5 ${isDark ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={
            vehicleIdFromUrl
              ? `/warehouse/vehicles/${vehicleIdFromUrl}`
              : "/warehouse/repairs"
          }
          className={`p-2 rounded-xl transition-colors ${isDark ? "bg-slate-800/50 hover:bg-slate-800 text-slate-400" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
        >
          <FiArrowLeft className="text-xl" />
        </Link>
        <div>
          <h1
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Buat Repair Order
          </h1>
          <p
            className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Buat order perbaikan untuk kendaraan warehouse
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Section 1: Pilih Kendaraan ──────────────────── */}
        <div className={`${cardClass} p-6`}>
          <h2
            className={`text-base font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <FiTruck className="text-emerald-500" /> Pilih Kendaraan
          </h2>

          <PaginatedSelectField
            label="Kendaraan"
            value={form.warehouseVehicleId}
            displayValue={vehicleDisplayLabel || undefined}
            onChange={handleVehicleChange}
            apiUrl="/warehouse/vehicles"
            queryParams={{
              showroomId: selectedShowroom?.id,
              sortDirection: "DESC",
            }}
            getLabel={(item) => {
              const v = item as VehicleItem;
              const st = statusLabels[v.status] || v.status;
              return `${v.brandName} ${v.modelName} (${v.year}) — ${v.licensePlate} [${st}]`;
            }}
            getValue={(item) => (item as VehicleItem).id}
            placeholder="Cari kendaraan berdasarkan merek, model, nopol..."
            disabled={!!vehicleIdFromUrl}
            required
          />

          {/* Vehicle info card */}
          {vehicleInfo && (
            <div
              className={`mt-4 rounded-xl p-4 border ${isDark ? "bg-slate-700/30 border-slate-700/50" : "bg-slate-50 border-slate-200"}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p
                    className={`font-bold text-lg ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {vehicleInfo.brandName} {vehicleInfo.modelName}
                  </p>
                  <p className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded inline-block mt-1">
                    {vehicleInfo.barcode}
                  </p>
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${
                    vehicleInfo.status === "IN_REPAIR"
                      ? "bg-orange-500/20 text-orange-500 border-orange-500/30"
                      : vehicleInfo.status === "IN_WAREHOUSE"
                        ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                        : vehicleInfo.status === "READY"
                          ? "bg-green-500/20 text-green-500 border-green-500/30"
                          : "bg-blue-500/20 text-blue-500 border-blue-500/30"
                  }`}
                >
                  {statusLabels[vehicleInfo.status] || vehicleInfo.status}
                </span>
              </div>

              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm`}>
                <InfoItem
                  label="Nopol"
                  value={vehicleInfo.licensePlate}
                  isDark={isDark}
                />
                <InfoItem
                  label="Tahun"
                  value={String(vehicleInfo.year)}
                  isDark={isDark}
                />
                <InfoItem
                  label="Warna"
                  value={vehicleInfo.color}
                  isDark={isDark}
                />
                <InfoItem
                  label="Transmisi"
                  value={vehicleInfo.transmission}
                  isDark={isDark}
                />
                <InfoItem
                  label="Kilometer"
                  value={`${Number(vehicleInfo.mileage).toLocaleString("id-ID")} km`}
                  isDark={isDark}
                />
                <InfoItem
                  label="Harga"
                  value={formatPrice(vehicleInfo.askingPrice)}
                  isDark={isDark}
                />
                <InfoItem
                  label="Penjual"
                  value={vehicleInfo.sellerName}
                  isDark={isDark}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Section 2: Detail Perbaikan ─────────────────── */}
        <div className={`${cardClass} p-6 space-y-4`}>
          <h2
            className={`text-base font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <FiTool className="text-orange-500" /> Detail Perbaikan
          </h2>

          <div>
            <label className={labelClass}>Jenis Perbaikan</label>
            <select
              name="repairType"
              value={form.repairType}
              onChange={(e) =>
                setForm({
                  ...form,
                  repairType: e.target.value as "light" | "heavy",
                })
              }
              className={inputClass}
            >
              <option value="light">Perbaikan Ringan</option>
              <option value="heavy">Perbaikan Berat</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Deskripsi Pekerjaan</label>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              required
              placeholder="Jelaskan pekerjaan perbaikan yang diperlukan..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <CurrencyInputField
            label="Estimasi Biaya (Rp)"
            name="estimatedCost"
            value={form.estimatedCost}
            onChange={(e) =>
              setForm({ ...form, estimatedCost: Number(e.target.value) })
            }
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={actionLoading || !form.warehouseVehicleId}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <FiSave /> Buat Repair Order
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// ── Sub-component ───────────────────────────────────────────
function InfoItem({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <div>
      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
        {label}
      </p>
      <p
        className={`font-medium text-sm ${isDark ? "text-slate-200" : "text-slate-800"}`}
      >
        {value}
      </p>
    </div>
  );
}

export default RepairForm;
