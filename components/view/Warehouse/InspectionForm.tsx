"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/state/store";
import {
  fetchVehicles,
  clearError,
  clearSuccess,
  createInspectionWithItems,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import { resolveMediaUrl } from "@/lib/media-url";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiSave,
  FiSearch,
  FiTruck,
  FiCheck,
  FiSend,
  FiTool,
  FiPlus,
  FiTrash2,
  FiAlertTriangle,
} from "react-icons/fi";
import { TbCar } from "react-icons/tb";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { decryptQueryParam, encryptSlug } from "@/lib/slug/slug";

import {
  INSPECTION_CATEGORIES,
  ItemConditionType,
} from "./inspection/INSPECTION_TEMPLATE";
import InspectionCategoryCard from "./inspection/InspectionCategoryCard";
import { InspectionItemData } from "./inspection/InspectionItemRow";
import CurrencyInputField from "@/components/ui/currency-input-field";

interface RepairOrderEntry {
  repairType: "light" | "heavy";
  description: string;
  estimatedCost: number;
}

// Initialize all items from template with default values
function initializeItems(): Record<string, InspectionItemData> {
  const items: Record<string, InspectionItemData> = {};
  INSPECTION_CATEGORIES.forEach((cat) => {
    cat.items.forEach((item) => {
      items[item.code] = {
        itemCode: item.code,
        itemName: item.name,
        category: cat.category,
        condition: "na" as ItemConditionType,
        notes: "",
        photos: [],
        previews: [],
      };
    });
  });
  return items;
}

const InspectionForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleIdFromUrl = decryptQueryParam(searchParams.get("vehicleId"));

  const { vehicles, selectedShowroom, actionLoading, error, successMessage } =
    useSelector((state: RootState) => state.warehouse);

  const [warehouseVehicleId, setWarehouseVehicleId] = useState(
    vehicleIdFromUrl || ""
  );
  const [inspectionType, setInspectionType] = useState<
    "initial" | "re_inspection" | "qc"
  >("initial");
  const [repairNotes, setRepairNotes] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [inspectionItems, setInspectionItems] = useState<
    Record<string, InspectionItemData>
  >(initializeItems);
  const [repairOrders, setRepairOrders] = useState<RepairOrderEntry[]>([]);

  const getImageUrl = resolveMediaUrl;

  useEffect(() => {
    if (selectedShowroom?.id) {
      dispatch(
        fetchVehicles({ showroomId: selectedShowroom.id, perPage: 100 })
      );
    }
  }, [dispatch, selectedShowroom]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccess());
      router.push(
        warehouseVehicleId
          ? `/warehouse/vehicles/${encryptSlug(warehouseVehicleId)}`
          : "/warehouse/inspections"
      );
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, router, warehouseVehicleId]);

  const handleItemChange = useCallback(
    (itemCode: string, updated: InspectionItemData) => {
      setInspectionItems((prev) => ({
        ...prev,
        [itemCode]: updated,
      }));
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseVehicleId) {
      toast.error("Pilih kendaraan terlebih dahulu");
      return;
    }

    // Check if at least some items are filled
    const filledItems = Object.values(inspectionItems).filter(
      (i) => i.condition !== "na"
    );
    if (filledItems.length === 0) {
      toast.error("Isi minimal 1 item inspeksi");
      return;
    }

    // Build items array for API
    const itemsPayload = Object.values(inspectionItems)
      .filter((i) => i.condition !== "na")
      .map((i) => ({
        category: i.category,
        itemName: i.itemName,
        itemCode: i.itemCode,
        condition: i.condition,
        notes: i.notes || "",
      }));

    // Collect all photos with item-index mapping
    const allPhotos: File[] = [];
    const filledItemsList = Object.values(inspectionItems).filter(
      (i) => i.condition !== "na"
    );
    filledItemsList.forEach((item, idx) => {
      item.photos.forEach((photo) => {
        // Rename file with item index prefix for backend mapping
        const renamedFile = new File(
          [photo],
          `item-${idx}-${photo.name}`,
          { type: photo.type }
        );
        allPhotos.push(renamedFile);
      });
    });

    // Build repair orders payload (only if there are valid entries)
    const validRepairOrders = repairOrders.filter(
      (ro) => ro.description.trim() !== ""
    );

    dispatch(
      createInspectionWithItems({
        warehouseVehicleId,
        inspectionType,
        repairNotes,
        items: JSON.stringify(itemsPayload),
        photos: allPhotos,
        repairOrders:
          validRepairOrders.length > 0
            ? JSON.stringify(validRepairOrders)
            : undefined,
      })
    );
  };

  // Filter vehicles by search
  const filteredVehicles = vehicles.filter((v) => {
    if (!vehicleSearch) return true;
    const q = vehicleSearch.toLowerCase();
    return (
      v.brandName?.toLowerCase().includes(q) ||
      v.modelName?.toLowerCase().includes(q) ||
      v.licensePlate?.toLowerCase().includes(q) ||
      v.barcode?.toLowerCase().includes(q) ||
      String(v.year).includes(q) ||
      v.color?.toLowerCase().includes(q)
    );
  });

  const selectedVehicle = vehicles.find((v) => v.id === warehouseVehicleId);

  // Stats
  const allItems = Object.values(inspectionItems);
  const filledCount = allItems.filter((i) => i.condition !== "na").length;
  const totalCount = allItems.length;
  const totalPhotos = allItems.reduce((acc, i) => acc + i.photos.length, 0);
  const damagedItems = allItems.filter(
    (i) => i.condition === "poor" || i.condition === "damaged"
  );
  const hasDamagedItems = damagedItems.length > 0;

  // Repair order helpers
  const addRepairOrder = () => {
    setRepairOrders([
      ...repairOrders,
      { repairType: "light", description: "", estimatedCost: 0 },
    ]);
  };

  const removeRepairOrder = (index: number) => {
    setRepairOrders(repairOrders.filter((_, i) => i !== index));
  };

  const updateRepairOrder = (
    index: number,
    field: keyof RepairOrderEntry,
    value: string | number
  ) => {
    const updated = [...repairOrders];
    updated[index] = { ...updated[index], [field]: value };
    setRepairOrders(updated);
  };

  const totalEstimatedRepairCost = repairOrders.reduce(
    (sum, ro) => sum + (ro.estimatedCost || 0),
    0
  );

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const cardClass = `${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl p-4 sm:p-6`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={
            vehicleIdFromUrl
              ? `/warehouse/vehicles/${encryptSlug(vehicleIdFromUrl)}`
              : "/warehouse/inspections"
          }
          className={`p-2 rounded-xl ${isDark ? "bg-slate-800/50 hover:bg-slate-800 text-slate-400" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
        >
          <FiArrowLeft className="text-xl" />
        </Link>
        <div>
          <h1
            className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Form Inspeksi Kendaraan
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Checklist inspeksi lengkap dengan foto bukti
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ============ PILIH KENDARAAN ============ */}
        <div className={cardClass}>
          <h2
            className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            <FiTruck className="text-emerald-500" /> Pilih Kendaraan
          </h2>

          {selectedVehicle && (
            <div
              className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border mb-4 ${
                isDark
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >
              <div
                className={`w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}
              >
                {selectedVehicle.images?.[0] ? (
                  <img
                    src={getImageUrl(selectedVehicle.images[0])}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <TbCar
                      className={`text-xl ${isDark ? "text-slate-500" : "text-slate-300"}`}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-bold text-sm ${isDark ? "text-emerald-300" : "text-emerald-800"}`}
                >
                  {selectedVehicle.brandName} {selectedVehicle.modelName}{" "}
                  {selectedVehicle.year}
                </p>
                <p
                  className={`text-xs ${isDark ? "text-emerald-400/70" : "text-emerald-600"}`}
                >
                  {selectedVehicle.licensePlate} &bull;{" "}
                  {selectedVehicle.color} &bull; {selectedVehicle.barcode}
                </p>
              </div>
              <FiCheck
                className={`text-xl flex-shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
              />
            </div>
          )}

          {!vehicleIdFromUrl && (
            <>
              <div className="relative mb-3">
                <FiSearch
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Cari kendaraan (nama, plat, barcode)..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>

              <div
                className={`rounded-xl border overflow-hidden max-h-64 overflow-y-auto ${isDark ? "border-slate-700/50" : "border-slate-200"}`}
              >
                {filteredVehicles.length === 0 ? (
                  <div
                    className={`flex flex-col items-center justify-center py-8 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    <TbCar className="text-3xl mb-2" />
                    <p className="text-sm">
                      {vehicles.length === 0
                        ? "Tidak ada kendaraan di showroom ini"
                        : "Tidak ada hasil pencarian"}
                    </p>
                  </div>
                ) : (
                  filteredVehicles.map((v) => {
                    const isSelected = warehouseVehicleId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setWarehouseVehicleId(v.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b last:border-b-0 ${
                          isSelected
                            ? isDark
                              ? "bg-emerald-500/15 border-emerald-500/20"
                              : "bg-emerald-50 border-emerald-100"
                            : isDark
                              ? "hover:bg-slate-800/50 border-slate-700/30"
                              : "hover:bg-slate-50 border-slate-100"
                        }`}
                      >
                        <div
                          className={`w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}
                        >
                          {v.images?.[0] ? (
                            <img
                              src={getImageUrl(v.images[0])}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <TbCar
                                className={`${isDark ? "text-slate-600" : "text-slate-300"}`}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}
                          >
                            {v.brandName} {v.modelName} {v.year}
                          </p>
                          <p
                            className={`text-xs truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}
                          >
                            {v.licensePlate} &bull; {v.color} &bull;{" "}
                            {v.barcode}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 capitalize ${
                            v.status === "REGISTERED"
                              ? "bg-blue-500/10 text-blue-500"
                              : v.status === "IN_WAREHOUSE"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : v.status === "IN_REPAIR"
                                  ? "bg-orange-500/10 text-orange-500"
                                  : "bg-slate-500/10 text-slate-500"
                          }`}
                        >
                          {v.status.replace(/_/g, " ")}
                        </span>
                        {isSelected && (
                          <FiCheck className="text-emerald-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              <p
                className={`text-[11px] mt-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
              >
                Menampilkan {filteredVehicles.length} dari {vehicles.length}{" "}
                kendaraan di {selectedShowroom?.name || "showroom"}
              </p>
            </>
          )}

          {vehicleIdFromUrl && !selectedVehicle && (
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Vehicle ID
              </label>
              <input
                type="text"
                value={vehicleIdFromUrl}
                readOnly
                className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-700/50 border-slate-600/50 text-slate-400" : "bg-slate-50 border-slate-300 text-slate-500"} border rounded-xl text-sm font-mono`}
              />
            </div>
          )}
        </div>

        {/* ============ TIPE INSPEKSI ============ */}
        <div className={cardClass}>
          <h2
            className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Tipe Inspeksi
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { value: "initial", label: "Initial", desc: "Inspeksi pertama kali" },
              { value: "re_inspection", label: "Re-Inspection", desc: "Inspeksi ulang setelah perbaikan" },
              { value: "qc", label: "Quality Control", desc: "Pengecekan kualitas akhir" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setInspectionType(
                    opt.value as "initial" | "re_inspection" | "qc"
                  )
                }
                className={`flex-1 min-w-[140px] p-3 rounded-xl border-2 text-left transition-all ${
                  inspectionType === opt.value
                    ? isDark
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-emerald-500 bg-emerald-50"
                    : isDark
                      ? "border-slate-700/50 hover:border-slate-600"
                      : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    inspectionType === opt.value
                      ? isDark
                        ? "text-emerald-400"
                        : "text-emerald-700"
                      : isDark
                        ? "text-white"
                        : "text-slate-900"
                  }`}
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

        {/* ============ CHECKLIST INSPEKSI ============ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Checklist Inspeksi
            </h2>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                {filledCount}/{totalCount} item terisi
              </span>
              {totalPhotos > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isDark
                      ? "bg-teal-500/20 text-teal-400"
                      : "bg-teal-50 text-teal-600"
                  }`}
                >
                  {totalPhotos} foto
                </span>
              )}
            </div>
          </div>

          {/* Overall progress bar */}
          <div
            className={`w-full h-2 rounded-full overflow-hidden mb-6 ${
              isDark ? "bg-slate-700" : "bg-slate-200"
            }`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
              style={{
                width: `${totalCount > 0 ? (filledCount / totalCount) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="space-y-4">
            {INSPECTION_CATEGORIES.map((cat) => {
              const categoryItems = cat.items.map(
                (item) => inspectionItems[item.code]
              );
              return (
                <InspectionCategoryCard
                  key={cat.category}
                  template={cat}
                  items={categoryItems}
                  onItemChange={handleItemChange}
                  isDark={isDark}
                />
              );
            })}
          </div>
        </div>

        {/* ============ CATATAN PERBAIKAN ============ */}
        <div className={cardClass}>
          <h2
            className={`text-lg font-semibold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Catatan Perbaikan
          </h2>
          <textarea
            value={repairNotes}
            onChange={(e) => setRepairNotes(e.target.value)}
            rows={3}
            placeholder="Catatan tambahan jika ada kerusakan atau perbaikan yang diperlukan..."
            className={`w-full px-4 py-3 ${isDark ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"} border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
          />
        </div>

        {/* ============ REPAIR ORDERS ============ */}
        {hasDamagedItems && (
          <div
            className={`${cardClass} ${
              isDark
                ? "border-orange-500/30 bg-orange-500/5"
                : "border-orange-200 bg-orange-50/50"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2
                  className={`text-lg font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  <FiTool className="text-orange-500" /> Repair Order
                </h2>
                <p
                  className={`text-xs mt-1 flex items-center gap-1 ${isDark ? "text-orange-400/70" : "text-orange-600"}`}
                >
                  <FiAlertTriangle size={12} />
                  Ditemukan {damagedItems.length} item bermasalah. Tambahkan
                  repair order jika diperlukan perbaikan.
                </p>
              </div>
              <button
                type="button"
                onClick={addRepairOrder}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-xl text-xs font-semibold transition-colors"
              >
                <FiPlus size={14} />
                Tambah Repair
              </button>
            </div>

            {/* Damaged items summary */}
            <div
              className={`mb-4 p-3 rounded-xl ${isDark ? "bg-slate-800/50" : "bg-white/80"}`}
            >
              <p
                className={`text-xs font-semibold mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Item Bermasalah:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {damagedItems.map((item) => (
                  <span
                    key={item.itemCode}
                    className={`text-[10px] px-2 py-1 rounded-lg font-medium ${
                      item.condition === "damaged"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {item.itemName} ({item.condition === "damaged" ? "Rusak" : "Buruk"})
                  </span>
                ))}
              </div>
            </div>

            {repairOrders.length === 0 ? (
              <p
                className={`text-xs text-center py-4 rounded-xl border border-dashed ${isDark ? "text-slate-500 border-slate-700" : "text-slate-400 border-slate-300"}`}
              >
                Belum ada repair order. Klik &quot;Tambah Repair&quot; untuk
                membuat order perbaikan.
              </p>
            ) : (
              <div className="space-y-3">
                {repairOrders.map((ro, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span
                        className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                      >
                        Repair #{i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRepairOrder(i)}
                        className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label
                          className={`block text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                        >
                          Jenis Perbaikan
                        </label>
                        <select
                          value={ro.repairType}
                          onChange={(e) =>
                            updateRepairOrder(
                              i,
                              "repairType",
                              e.target.value as "light" | "heavy"
                            )
                          }
                          className={`w-full px-3 py-2 rounded-xl border text-sm ${isDark ? "bg-slate-700/50 border-slate-600/50 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                        >
                          <option value="light">Perbaikan Ringan</option>
                          <option value="heavy">Perbaikan Berat</option>
                        </select>
                      </div>

                      <div>
                        <label
                          className={`block text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                        >
                          Deskripsi Pekerjaan
                        </label>
                        <textarea
                          value={ro.description}
                          onChange={(e) =>
                            updateRepairOrder(i, "description", e.target.value)
                          }
                          rows={2}
                          placeholder="Jelaskan perbaikan yang diperlukan..."
                          className={`w-full px-3 py-2 rounded-xl border text-sm resize-none ${isDark ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`}
                        />
                      </div>

                      <CurrencyInputField
                        label="Estimasi Biaya (Rp)"
                        name={`repairCost-${i}`}
                        value={ro.estimatedCost}
                        onChange={(e) =>
                          updateRepairOrder(
                            i,
                            "estimatedCost",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                ))}

                {/* Total estimated cost */}
                {totalEstimatedRepairCost > 0 && (
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl ${isDark ? "bg-orange-500/10" : "bg-orange-50 border border-orange-200"}`}
                  >
                    <span
                      className={`text-sm font-semibold ${isDark ? "text-orange-300" : "text-orange-700"}`}
                    >
                      Total Estimasi Biaya Perbaikan
                    </span>
                    <span
                      className={`text-sm font-bold ${isDark ? "text-orange-300" : "text-orange-700"}`}
                    >
                      {formatPrice(totalEstimatedRepairCost)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============ SUMMARY & SUBMIT ============ */}
        <div
          className={`${cardClass} ${
            isDark ? "bg-slate-800/80" : "bg-gradient-to-r from-slate-50 to-emerald-50"
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Ringkasan Inspeksi
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div
              className={`p-3 rounded-xl text-center ${
                isDark ? "bg-slate-700/50" : "bg-white border border-slate-200"
              }`}
            >
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {filledCount}
              </p>
              <p
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Item Terisi
              </p>
            </div>
            <div
              className={`p-3 rounded-xl text-center ${
                isDark ? "bg-slate-700/50" : "bg-white border border-slate-200"
              }`}
            >
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {totalPhotos}
              </p>
              <p
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Foto Bukti
              </p>
            </div>
            <div
              className={`p-3 rounded-xl text-center ${
                isDark ? "bg-slate-700/50" : "bg-white border border-slate-200"
              }`}
            >
              <p className="text-2xl font-bold text-green-500">
                {allItems.filter((i) => i.condition === "good").length}
              </p>
              <p
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Baik
              </p>
            </div>
            <div
              className={`p-3 rounded-xl text-center ${
                isDark ? "bg-slate-700/50" : "bg-white border border-slate-200"
              }`}
            >
              <p className="text-2xl font-bold text-red-500">
                {allItems.filter(
                  (i) => i.condition === "poor" || i.condition === "damaged"
                ).length}
              </p>
              <p
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Bermasalah
              </p>
            </div>
          </div>

          {/* Repair order summary */}
          {repairOrders.length > 0 && (
            <div
              className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${isDark ? "bg-orange-500/10 border border-orange-500/20" : "bg-orange-50 border border-orange-200"}`}
            >
              <FiTool
                className={`text-lg ${isDark ? "text-orange-400" : "text-orange-500"}`}
              />
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${isDark ? "text-orange-300" : "text-orange-700"}`}
                >
                  {repairOrders.length} Repair Order akan dibuat
                </p>
                {totalEstimatedRepairCost > 0 && (
                  <p
                    className={`text-xs ${isDark ? "text-orange-400/70" : "text-orange-600"}`}
                  >
                    Estimasi: {formatPrice(totalEstimatedRepairCost)} &bull;
                    Kendaraan akan masuk gudang perbaikan
                  </p>
                )}
              </div>
            </div>
          )}

          <p
            className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {repairOrders.length > 0
              ? "Setelah submit, inspeksi akan dikirim untuk approval dan kendaraan akan masuk ke gudang perbaikan."
              : "Setelah submit, inspeksi akan dikirim ke Kepala Inspeksi untuk di-review dan disetujui."}
          </p>

          <button
            type="submit"
            disabled={actionLoading || !warehouseVehicleId || filledCount === 0}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 ${
              repairOrders.length > 0
                ? "bg-gradient-to-r from-orange-500 to-amber-600"
                : "bg-gradient-to-r from-emerald-500 to-teal-600"
            } text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {actionLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <FiSend />{" "}
                {repairOrders.length > 0
                  ? "Submit Inspeksi & Buat Repair Order"
                  : "Submit Inspeksi untuk Approval"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InspectionForm;
