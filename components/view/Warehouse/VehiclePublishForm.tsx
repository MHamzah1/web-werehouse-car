"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/state/store";
import {
  fetchListingByVehicleId,
  publishVehicle,
  updateListing,
  unpublishVehicle,
  clearListingError,
  clearListingSuccess,
} from "@/lib/state/slice/listing/listingSlice";
import { fetchVehicleDetail } from "@/lib/state/slice/warehouse/warehouseSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { CurrencyInputField, InputField } from "@/components/ui";
import { encryptSlug } from "@/lib/slug/slug";
import {
  FiArrowLeft,
  FiSave,
  FiGlobe,
  FiEyeOff,
  FiPlus,
  FiX,
  FiCheck,
  FiVideo,
  FiPhone,
  FiTag,
  FiStar,
} from "react-icons/fi";

interface VehiclePublishFormProps {
  vehicleId: string;
}

const VehiclePublishForm = ({ vehicleId }: VehiclePublishFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  const { loading, error, success, selectedListing } = useSelector(
    (state: RootState) => state.listing,
  );
  const { selectedVehicle } = useSelector((state: RootState) => state.warehouse);

  const [form, setForm] = useState({
    listingTitle: "",
    askingPrice: 0,
    isNegotiable: false,
    description: "",
    highlights: [] as string[],
    videoUrl: "",
    contactName: "",
    contactPhone: "",
    contactWhatsapp: "",
  });

  const [highlightInput, setHighlightInput] = useState("");
  const workflow = selectedVehicle?.workflow;
  const isPublished =
    selectedListing?.status === "PUBLISHED" ||
    workflow?.workflowStage === "PUBLISHED";
  const canPublishListing = !!workflow?.allowedActions?.canPublishListing;
  const canUnpublishListing = !!workflow?.allowedActions?.canUnpublishListing;

  // Load vehicle + existing listing
  useEffect(() => {
    dispatch(fetchVehicleDetail(vehicleId));
    dispatch(fetchListingByVehicleId(vehicleId));
  }, [dispatch, vehicleId]);

  // Pre-fill form if listing exists
  useEffect(() => {
    if (selectedListing) {
      setForm({
        listingTitle: selectedListing.listingTitle || "",
        askingPrice: Number(selectedListing.askingPrice) || 0,
        isNegotiable: selectedListing.isNegotiable || false,
        description: selectedListing.description || "",
        highlights: selectedListing.highlights || [],
        videoUrl: selectedListing.videoUrl || "",
        contactName: selectedListing.contactName || "",
        contactPhone: selectedListing.contactPhone || "",
        contactWhatsapp: selectedListing.contactWhatsapp || "",
      });
    } else if (selectedVehicle) {
      // Auto-fill dari data vehicle
      setForm((prev) => ({
        ...prev,
        listingTitle: `${selectedVehicle.brandName} ${selectedVehicle.modelName} ${selectedVehicle.year} - ${selectedVehicle.color || ""}`.trim(),
        askingPrice: Number(selectedVehicle.askingPrice) || 0,
        contactName: selectedVehicle.sellerName || "",
        contactPhone: selectedVehicle.sellerPhone || "",
        contactWhatsapp: selectedVehicle.sellerWhatsapp || "",
      }));
    }
  }, [selectedListing, selectedVehicle]);

  // Handle success/error
  useEffect(() => {
    if (success) {
      toast.success(
        isPublished ? "Listing berhasil diupdate!" : "Kendaraan berhasil dipublish ke landing page!",
      );
      dispatch(clearListingSuccess());
      router.push(`/warehouse/vehicles/${encryptSlug(vehicleId)}`);
    }
    if (error) {
      toast.error(error);
      dispatch(clearListingError());
    }
  }, [success, error, dispatch, router, vehicleId, isPublished]);

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addHighlight = () => {
    const trimmed = highlightInput.trim();
    if (!trimmed || form.highlights.includes(trimmed)) return;
    setForm((prev) => ({ ...prev, highlights: [...prev.highlights, trimmed] }));
    setHighlightInput("");
  };

  const removeHighlight = (index: number) => {
    setForm((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPublished && !canPublishListing) {
      toast.error("Kendaraan belum memenuhi syarat publish dari backend");
      return;
    }
    if (!form.listingTitle.trim()) {
      toast.error("Judul listing wajib diisi");
      return;
    }
    if (!form.askingPrice || form.askingPrice <= 0) {
      toast.error("Harga jual wajib diisi");
      return;
    }

    if (isPublished) {
      dispatch(updateListing({ vehicleId, payload: form }));
    } else {
      dispatch(publishVehicle({ vehicleId, payload: form }));
    }
  };

  const handleUnpublish = () => {
    if (!canUnpublishListing) {
      toast.error("Listing ini tidak dapat diunpublish");
      return;
    }
    if (!confirm("Kendaraan akan dihapus dari landing page. Lanjutkan?")) return;
    dispatch(unpublishVehicle(vehicleId)).then(() => {
      toast.success("Kendaraan berhasil diunpublish");
      router.push(`/warehouse/vehicles/${encryptSlug(vehicleId)}`);
    });
  };

  const sectionClass = `rounded-2xl border p-6 mb-6 ${
    isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
  }`;

  const labelClass = `block text-sm font-medium mb-1.5 ${
    isDark ? "text-slate-300" : "text-slate-700"
  }`;

  const inputClass = `w-full px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
    isDark
      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
  }`;

  const textareaClass = `w-full px-4 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${
    isDark
      ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
  }`;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/warehouse/vehicles/${vehicleId}`}
          className={`p-2 rounded-xl border transition-colors ${
            isDark
              ? "border-slate-700 hover:bg-slate-700 text-slate-400"
              : "border-slate-200 hover:bg-slate-50 text-slate-600"
          }`}
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {isPublished ? "Edit Listing" : "Publish ke Landing Page"}
          </h1>
          {selectedVehicle && (
            <p
              className={`text-sm mt-0.5 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {selectedVehicle.brandName} {selectedVehicle.modelName}{" "}
              {selectedVehicle.year} · {selectedVehicle.licensePlate}
            </p>
          )}
        </div>

        {isPublished && (
          <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
            Sudah Dipublish
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-0">
        {selectedVehicle && !isPublished && !canPublishListing && (
          <div
            className={`rounded-2xl border p-4 mb-6 ${
              isDark
                ? "bg-amber-500/10 border-amber-500/20 text-amber-200"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            Kendaraan belum bisa dipublish. Pastikan statusnya sudah READY,
            inspeksi sudah approved, repair aktif tidak ada, dan pencairan
            aktif sudah dibuat.
          </div>
        )}
        {/* ── Info Utama ── */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-5">
            <FiTag className="text-emerald-500 w-5 h-5" />
            <h2
              className={`font-semibold text-base ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              Informasi Listing
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Judul Listing <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className={inputClass}
                value={form.listingTitle}
                onChange={(e) => handleChange("listingTitle", e.target.value)}
                placeholder="Contoh: Toyota Avanza 2020 G CVT - Kondisi Prima"
                maxLength={200}
              />
              <p
                className={`text-xs mt-1 ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {form.listingTitle.length}/200 karakter
              </p>
            </div>

            <div>
              <label className={labelClass}>
                Harga Jual <span className="text-red-400">*</span>
              </label>
              <CurrencyInputField
                label=""
                value={form.askingPrice}
                onChange={(val) => handleChange("askingPrice", val)}
                placeholder="Masukkan harga jual"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleChange("isNegotiable", !form.isNegotiable)}
                className={`w-12 h-6 rounded-full transition-colors flex items-center ${
                  form.isNegotiable ? "bg-emerald-500" : isDark ? "bg-slate-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                    form.isNegotiable ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <label
                className={`text-sm cursor-pointer ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
                onClick={() => handleChange("isNegotiable", !form.isNegotiable)}
              >
                Harga bisa nego
              </label>
            </div>

            <div>
              <label className={labelClass}>Deskripsi Kendaraan</label>
              <textarea
                className={textareaClass}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                placeholder="Jelaskan kondisi kendaraan, riwayat perawatan, keunggulan, dll."
              />
            </div>
          </div>
        </div>

        {/* ── Highlight / Keunggulan ── */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-5">
            <FiStar className="text-yellow-500 w-5 h-5" />
            <h2
              className={`font-semibold text-base ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              Keunggulan Kendaraan
            </h2>
          </div>

          {/* Existing highlights */}
          <div className="flex flex-wrap gap-2 mb-3">
            {form.highlights.map((h, i) => (
              <span
                key={i}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  isDark
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                <FiCheck className="w-3.5 h-3.5" />
                {h}
                <button
                  type="button"
                  onClick={() => removeHighlight(i)}
                  className="ml-1 hover:opacity-60"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Add highlight */}
          <div className="flex gap-2">
            <input
              type="text"
              className={`flex-1 ${inputClass}`}
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addHighlight();
                }
              }}
              placeholder="Contoh: Tangan Pertama, Pajak Hidup, Service Record"
            />
            <button
              type="button"
              onClick={addHighlight}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" />
              Tambah
            </button>
          </div>

          <p
            className={`text-xs mt-2 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Tekan Enter atau klik Tambah untuk menambahkan poin keunggulan
          </p>
        </div>

        {/* ── Video ── */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-5">
            <FiVideo className="text-red-500 w-5 h-5" />
            <h2
              className={`font-semibold text-base ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              Video (Opsional)
            </h2>
          </div>
          <div>
            <label className={labelClass}>Link YouTube</label>
            <input
              type="url"
              className={inputClass}
              value={form.videoUrl}
              onChange={(e) => handleChange("videoUrl", e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>

        {/* ── Kontak Pembeli ── */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-5">
            <FiPhone className="text-blue-500 w-5 h-5" />
            <h2
              className={`font-semibold text-base ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              Informasi Kontak
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Nama Kontak</label>
              <input
                type="text"
                className={inputClass}
                value={form.contactName}
                onChange={(e) => handleChange("contactName", e.target.value)}
                placeholder="Nama PIC"
              />
            </div>
            <div>
              <label className={labelClass}>Nomor Telepon</label>
              <input
                type="tel"
                className={inputClass}
                value={form.contactPhone}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                placeholder="081234567890"
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp</label>
              <input
                type="tel"
                className={inputClass}
                value={form.contactWhatsapp}
                onChange={(e) =>
                  handleChange("contactWhatsapp", e.target.value)
                }
                placeholder="081234567890"
              />
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-between gap-4 pt-2">
          {isPublished && (
            <button
              type="button"
              onClick={handleUnpublish}
              disabled={loading || !canUnpublishListing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <FiEyeOff className="w-4 h-4" />
              Unpublish
            </button>
          )}

          <div className="flex gap-3 ml-auto">
            <Link
              href={`/warehouse/vehicles/${encryptSlug(vehicleId)}`}
              className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                isDark
                  ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={loading || (!isPublished && !canPublishListing)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : isPublished ? (
                <FiSave className="w-4 h-4" />
              ) : (
                <FiGlobe className="w-4 h-4" />
              )}
              {loading
                ? "Menyimpan..."
                : isPublished
                  ? "Update Listing"
                  : "Publish ke Landing Page"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VehiclePublishForm;
