"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/state/store";
import {
  registerVehicle,
  clearError,
  clearSuccess,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiUpload, FiX } from "react-icons/fi";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import PaginatedSelectField from "@/components/ui/paginated-select-field";
import {
  CurrencyInputField,
  InputField,
  PhoneInputField,
} from "@/components/ui";

// ── helper types ──────────────────────────────────────────────
interface BrandItem {
  id: string;
  name: string;
}
interface CarModelItem {
  id: string;
  brandId: string;
  modelName: string;
  brand?: { name: string };
}
interface VariantItem {
  id: string;
  modelId: string;
  variantName: string;
  transmissionType?: string;
}
interface YearPriceItem {
  id: string;
  variantId: string;
  year: number;
  basePrice: string;
  variant?: { variantName: string };
}

// Allowed image types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILES = 10;

const VehicleRegisterForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { actionLoading, error, successMessage, selectedShowroom } =
    useSelector((state: RootState) => state.warehouse);

  const [form, setForm] = useState({
    showroomId: "",
    carModelId: "",
    variantId: "",
    variantName: "",
    yearPriceId: "",
    brandName: "",
    modelName: "",
    year: new Date().getFullYear(),
    color: "",
    licensePlate: "",
    chassisNumber: "",
    engineNumber: "",
    mileage: 0,
    fuelType: "bensin",
    askingPrice: 0,
    sellerName: "",
    sellerPhone: "62",
    sellerWhatsapp: "62",
    sellerKtp: "",
    // description: "",
    condition: "bekas",
    ownershipStatus: "Tangan Pertama",
    taxStatus: "Pajak Hidup",
    locationCity: "",
    locationProvince: "",
    notes: "",
  });

  // display labels for cascaded selects
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");

  // Storage for images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedShowroom)
      setForm((f) => ({ ...f, showroomId: selectedShowroom.id }));
  }, [selectedShowroom]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccess());
      router.push("/warehouse/vehicles");
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, router]);

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Validasi & Image Handlers
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File "${file.name}" tidak valid. Hanya JPG, PNG, WEBP.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File "${file.name}" terlalu besar. Max ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    const errors: string[] = [];

    if (imageFiles.length >= MAX_FILES) {
      toast.error(`Maksimal ${MAX_FILES} gambar`);
      return;
    }

    const remainingSlots = MAX_FILES - imageFiles.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
    }
    if (newFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...newFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      registerVehicle({
        showroomId: form.showroomId,
        brandName: form.brandName,
        modelName: form.modelName,
        year: Number(form.year),
        carModelId: form.carModelId,
        variantId: form.variantId,
        yearPriceId: form.yearPriceId,
        color: form.color,
        licensePlate: form.licensePlate,
        chassisNumber: form.chassisNumber,
        engineNumber: form.engineNumber,
        mileage: Number(form.mileage),
        fuelType: form.fuelType,
        askingPrice: Number(form.askingPrice),
        ownershipStatus: form.ownershipStatus,
        taxStatus: form.taxStatus,
        locationCity: form.locationCity,
        locationProvince: form.locationProvince,
        sellerName: form.sellerName,
        sellerPhone: form.sellerPhone,
        sellerWhatsapp: form.sellerWhatsapp,
        sellerKtp: form.sellerKtp,
        // description: form.description,
        condition: form.condition,
        notes: form.notes,
        images: imageFiles,
      }),
    );
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ── Cascaded select handlers ──────────────────────────────
  const handleBrandChange = (_val: string, item: unknown) => {
    const brand = item as BrandItem;
    setSelectedBrandId(brand.id);
    setSelectedModelId("");
    setForm((f) => ({
      ...f,
      brandName: brand.name,
      carModelId: "",
      modelName: "",
      variantId: "",
      variantName: "",
      yearPriceId: "",
      year: new Date().getFullYear(),
    }));
  };

  const handleCarModelChange = (_val: string, item: unknown) => {
    const model = item as CarModelItem;
    setSelectedModelId(model.id);
    setForm((f) => ({
      ...f,
      carModelId: model.id,
      modelName: model.modelName,
      variantId: "",
      variantName: "",
      yearPriceId: "",
      year: new Date().getFullYear(),
    }));
  };

  const handleVariantChange = (_val: string, item: unknown) => {
    const variant = item as VariantItem;
    const label = `${variant.variantName}${variant.transmissionType ? ` (${variant.transmissionType})` : ""}`;
    setForm((f) => ({
      ...f,
      variantId: variant.id,
      variantName: label,
      yearPriceId: "",
    }));
  };

  const handleYearPriceChange = (_val: string, item: unknown) => {
    const yp = item as YearPriceItem;
    setForm((f) => ({
      ...f,
      yearPriceId: yp.id,
      year: yp.year,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/warehouse/vehicles"
          className={`p-2 rounded-xl transition-colors ${isDark ? "bg-slate-800/50 hover:bg-slate-800 text-slate-400" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
        >
          <FiArrowLeft className="text-xl" />
        </Link>
        <div>
          <h1
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Register Kendaraan
          </h1>
          <p
            className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Daftarkan kendaraan baru ke warehouse
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data Kendaraan */}
        <div
          className={`${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl p-6`}
        >
          <h2
            className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Data Kendaraan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Brand */}
            <PaginatedSelectField
              label="Merek"
              value={selectedBrandId}
              displayValue={form.brandName}
              onChange={handleBrandChange}
              apiUrl="/brand/paged"
              getLabel={(item) => (item as BrandItem).name}
              getValue={(item) => (item as BrandItem).id}
              placeholder="Pilih merek..."
              required
            />

            {/* Car Model */}
            <PaginatedSelectField
              label="Model"
              value={form.carModelId}
              displayValue={form.modelName}
              onChange={handleCarModelChange}
              apiUrl="/car-models"
              queryParams={selectedBrandId ? { brandId: selectedBrandId } : {}}
              getLabel={(item) => (item as CarModelItem).modelName}
              getValue={(item) => (item as CarModelItem).id}
              placeholder={
                selectedBrandId ? "Pilih model..." : "Pilih merek dulu"
              }
              disabled={!selectedBrandId}
              required
            />

            {/* Variant */}
            <PaginatedSelectField
              label="Varian"
              value={form.variantId}
              displayValue={form.variantName || undefined}
              onChange={handleVariantChange}
              apiUrl="/variants"
              queryParams={selectedModelId ? { modelId: selectedModelId } : {}}
              getLabel={(item) => {
                const v = item as VariantItem;
                return `${v.variantName}${v.transmissionType ? ` (${v.transmissionType})` : ""}`;
              }}
              getValue={(item) => (item as VariantItem).id}
              placeholder={
                selectedModelId ? "Pilih varian..." : "Pilih model dulu"
              }
              disabled={!selectedModelId}
              required
            />

            {/* Year Price */}
            <PaginatedSelectField
              label="Tahun & Harga Dasar"
              value={form.yearPriceId}
              displayValue={
                form.yearPriceId && form.year ? `${form.year}` : undefined
              }
              onChange={handleYearPriceChange}
              apiUrl="/year-prices"
              queryParams={form.variantId ? { variantId: form.variantId } : {}}
              getLabel={(item) => {
                const yp = item as YearPriceItem;
                return `${yp.year} — Rp ${Number(yp.basePrice).toLocaleString("id-ID")}`;
              }}
              getValue={(item) => (item as YearPriceItem).id}
              placeholder={
                form.variantId ? "Pilih tahun..." : "Pilih varian dulu"
              }
              disabled={!form.variantId}
              required
            />

            <InputField
              label="Warna"
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="Hitam"
              required
            />
            <InputField
              label="Nomor Polisi"
              name="licensePlate"
              value={form.licensePlate}
              onChange={handleChange}
              placeholder="B 1234 ABC"
              required
            />
            <InputField
              label="Nomor Rangka (VIN)"
              name="chassisNumber"
              value={form.chassisNumber}
              onChange={handleChange}
              required
            />
            <InputField
              label="Nomor Mesin"
              name="engineNumber"
              value={form.engineNumber}
              onChange={handleChange}
              required
            />
            <InputField
              label="Kilometer"
              name="mileage"
              type="number"
              value={form.mileage}
              onChange={handleChange}
              required
            />

            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Bahan Bakar
              </label>
              <select
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-700/50 border-slate-600/50 text-white" : "bg-white border-slate-300 text-slate-900"} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
              >
                <option value="bensin">Bensin</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </select>
            </div>

            <CurrencyInputField
              label="Harga Jual (Rp)"
              name="askingPrice"
              value={Number(form.askingPrice)}
              onChange={handleChange}
              required
            />

            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Kondisi
              </label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-700/50 border-slate-600/50 text-white" : "bg-white border-slate-300 text-slate-900"} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
              >
                <option value="bekas">Bekas</option>
                <option value="baru">Baru</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Status Kepemilikan
              </label>
              <select
                name="ownershipStatus"
                value={form.ownershipStatus}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-700/50 border-slate-600/50 text-white" : "bg-white border-slate-300 text-slate-900"} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
              >
                <option value="Tangan Pertama">Tangan Pertama</option>
                <option value="Tangan Kedua">Tangan Kedua</option>
                <option value="Tangan Ketiga+">Tangan Ketiga+</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Status Pajak
              </label>
              <select
                name="taxStatus"
                value={form.taxStatus}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-700/50 border-slate-600/50 text-white" : "bg-white border-slate-300 text-slate-900"} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
              >
                <option value="Pajak Hidup">Pajak Hidup</option>
                <option value="Pajak Mati">Pajak Mati</option>
              </select>
            </div>

            <InputField
              label="Kota Lokasi"
              name="locationCity"
              value={form.locationCity}
              onChange={handleChange}
            />
            <InputField
              label="Provinsi Lokasi"
              name="locationProvince"
              value={form.locationProvince}
              onChange={handleChange}
            />

            {/* <div className="md:col-span-2">
              <label
                className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Deskripsi
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-700/50 border-slate-600/50 text-white" : "bg-white border-slate-300 text-slate-900"} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
              />
            </div> */}
            <div className="md:col-span-2">
              <label
                className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}
              >
                Catatan Internal (Notes)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-700/50 border-slate-600/50 text-white" : "bg-white border-slate-300 text-slate-900"} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
              />
            </div>
          </div>
        </div>

        {/* Data Penjual */}
        <div
          className={`${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl p-6`}
        >
          <h2
            className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Data Penjual
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Nama Penjual"
              name="sellerName"
              value={form.sellerName}
              onChange={handleChange}
              required
            />
            <PhoneInputField
              label="Telepon Penjual"
              name="sellerPhone"
              value={form.sellerPhone}
              onChange={handleChange}
              placeholder="8123456789"
              required
            />
            <PhoneInputField
              label="WhatsApp Penjual"
              name="sellerWhatsapp"
              value={form.sellerWhatsapp || "62"}
              onChange={handleChange}
              placeholder="8123456789"
            />
            <InputField
              label="KTP Penjual"
              name="sellerKtp"
              value={form.sellerKtp || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Upload Gambar */}
        <div
          className={`${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl p-6`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Upload Gambar
            </h2>
            <span
              className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {imageFiles.length} / {MAX_FILES} gambar
            </span>
          </div>

          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
              dragActive
                ? "border-emerald-500 bg-emerald-500/5"
                : isDark
                  ? "border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800"
                  : "border-slate-300 hover:border-emerald-500/50 hover:bg-slate-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDark ? "bg-slate-800" : "bg-white shadow-sm"
              }`}
            >
              <FiUpload
                className={`text-2xl ${isDark ? "text-slate-400" : "text-slate-500"}`}
              />
            </div>
            <p
              className={`text-base font-medium mb-2 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Klik atau tarik gambar ke sini
            </p>
            <p
              className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Format: JPG, PNG, WEBP (Max: {MAX_FILE_SIZE_MB}MB)
            </p>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
              {imagePreviews.map((url, index) => (
                <div key={index} className="relative aspect-[4/3] group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 shadow-lg"
                  >
                    <FiX />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium rounded-lg">
                      Utama
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
        >
          {actionLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <FiSave /> Register Kendaraan
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default VehicleRegisterForm;
