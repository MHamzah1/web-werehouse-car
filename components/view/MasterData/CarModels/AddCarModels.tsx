/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Car,
  FileText,
  Link,
  ToggleLeft,
  Image as ImageIcon,
  DollarSign,
  Tag,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { AppDispatch, RootState } from "@/lib/state/store";
import { getBrandsForSelect, Brand } from "@/lib/state/slice/brand/brandSlice";
import Alert from "@/components/feature/alert/alert";
import { cn } from "@/lib/utils";
import { createCarModels } from "@/lib/state/slice/car-models/CarModelsSlice";

// ============================================
// Validation Schema
// ============================================
const carModelSchema = z.object({
  brandId: z.string().min(1, "Brand wajib dipilih"),
  modelName: z
    .string()
    .min(1, "Nama model wajib diisi")
    .min(2, "Nama model minimal 2 karakter")
    .max(100, "Nama model maksimal 100 karakter"),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional(),
  basePrice: z
    .string()
    .min(1, "Harga dasar wajib diisi")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Harga harus berupa angka positif",
    }),
  imageUrl: z
    .string()
    .url("Format URL tidak valid")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

type CarModelFormData = z.infer<typeof carModelSchema>;

// Format number to currency display
const formatCurrencyInput = (value: string) => {
  const number = value.replace(/\D/g, "");
  return new Intl.NumberFormat("id-ID").format(Number(number));
};

// ============================================
// Component
// ============================================
export default function AddCarModel() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const { loading } = useSelector((state: RootState) => state.CarModels);
  const { data: brands, loading: brandsLoading } = useSelector(
    (state: RootState) => state.brand
  );

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [displayPrice, setDisplayPrice] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CarModelFormData>({
    resolver: zodResolver(carModelSchema),
    defaultValues: {
      brandId: "",
      modelName: "",
      description: "",
      basePrice: "",
      imageUrl: "",
      isActive: true,
    },
  });

  const watchImageUrl = watch("imageUrl");
  const watchIsActive = watch("isActive");
  const watchBrandId = watch("brandId");

  // Load brands for select
  useEffect(() => {
    dispatch(getBrandsForSelect({ page: 1, perPage: 100 }));
  }, [dispatch]);

  // Update image preview when URL changes
  useEffect(() => {
    if (watchImageUrl && watchImageUrl.length > 0) {
      setImagePreview(watchImageUrl);
    } else {
      setImagePreview(null);
    }
  }, [watchImageUrl]);

  // Handle price input with formatting
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setValue("basePrice", rawValue);
    setDisplayPrice(formatCurrencyInput(rawValue));
  };

  // ============================================
  // Handlers
  // ============================================
  const onSubmit = async (data: CarModelFormData) => {
    const confirmed = await Alert.confirmSave(
      "Simpan Car Model Baru?",
      "Apakah Anda yakin ingin menyimpan car model baru ini?"
    );

    if (!confirmed) return;

    try {
      Alert.loading("Menyimpan data...");

      const payload = {
        brandId: data.brandId,
        modelName: data.modelName,
        description: data.description || null,
        basePrice: Number(data.basePrice),
        imageUrl: data.imageUrl || null,
        isActive: data.isActive,
      };

      await dispatch(createCarModels(payload)).unwrap();

      Alert.closeLoading();
      await Alert.success("Berhasil!", "Car Model baru berhasil ditambahkan");
      router.push("/MasterData/CarModel/Table");
    } catch (error: any) {
      Alert.closeLoading();
      await Alert.error(
        "Gagal!",
        error?.message || "Gagal menambahkan car model baru"
      );
    }
  };

  const handleCancel = async () => {
    const confirmed = await Alert.confirmDiscard();
    if (confirmed) {
      router.push("/MasterData/CarModel/Table");
    }
  };

  const handleReset = async () => {
    const confirmed = await Alert.confirm(
      "Reset Form?",
      "Semua data yang sudah diisi akan dihapus.",
      "Ya, Reset",
      "Batal"
    );
    if (confirmed) {
      reset();
      setImagePreview(null);
      setDisplayPrice("");
      Alert.toast.info("Form berhasil direset");
    }
  };

  // Get selected brand
  const selectedBrand = brands.find((b: Brand) => b.id === watchBrandId);

  // ============================================
  // Render
  // ============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className={cn(
              "p-2 rounded-xl transition-all duration-200",
              isDarkMode
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            )}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Tambah Car Model Baru
            </h1>
            <p
              className={cn(
                "text-sm mt-1",
                isDarkMode ? "text-slate-400" : "text-slate-600"
              )}
            >
              Isi form di bawah untuk menambahkan model mobil baru
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          className={cn(
            "rounded-2xl border backdrop-blur-sm p-6 lg:p-8",
            isDarkMode
              ? "bg-slate-800/50 border-slate-700/50"
              : "bg-white border-slate-200 shadow-lg"
          )}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section: Informasi Car Model */}
              <div>
                <h2
                  className={cn(
                    "text-lg font-bold mb-4 flex items-center gap-2",
                    isDarkMode ? "text-white" : "text-slate-900"
                  )}
                >
                  <Car size={20} className="text-cyan-400" />
                  Informasi Car Model
                </h2>

                <div className="space-y-4">
                  {/* Brand Select */}
                  <div>
                    <label
                      className={cn(
                        "block text-sm font-semibold mb-2",
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      )}
                    >
                      Brand<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2",
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        )}
                      >
                        <Tag size={20} />
                      </div>
                      <select
                        className={cn(
                          "w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 appearance-none cursor-pointer",
                          "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent",
                          errors.brandId
                            ? "border-red-500 bg-red-500/10"
                            : isDarkMode
                            ? "bg-slate-800/50 border-slate-700/50 text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        )}
                        {...register("brandId")}
                        disabled={brandsLoading}
                      >
                        <option value="">
                          {brandsLoading ? "Memuat brand..." : "Pilih Brand"}
                        </option>
                        {brands
                          .filter((brand: Brand) => brand.isActive)
                          .map((brand: Brand) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))}
                      </select>
                      <div
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        )}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    {errors.brandId && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.brandId.message}
                      </p>
                    )}
                    {selectedBrand && (
                      <div
                        className={cn(
                          "mt-2 p-2 rounded-lg flex items-center gap-2",
                          isDarkMode ? "bg-slate-800" : "bg-slate-100"
                        )}
                      >
                        {selectedBrand.logo && (
                          <img
                            src={selectedBrand.logo}
                            alt={selectedBrand.name}
                            className="w-6 h-6 rounded object-contain"
                          />
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            isDarkMode ? "text-slate-300" : "text-slate-700"
                          )}
                        >
                          {selectedBrand.name} - {selectedBrand.description}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Model Name */}
                  <div>
                    <label
                      className={cn(
                        "block text-sm font-semibold mb-2",
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      )}
                    >
                      Nama Model<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2",
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        )}
                      >
                        <Car size={20} />
                      </div>
                      <input
                        type="text"
                        placeholder="Masukkan nama model (cth: Fortuner, Civic)"
                        className={cn(
                          "w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300",
                          "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent",
                          errors.modelName
                            ? "border-red-500 bg-red-500/10"
                            : isDarkMode
                            ? "bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                            : "bg-white border-slate-300 text-slate-900 placeholder:text-gray-400"
                        )}
                        {...register("modelName")}
                      />
                    </div>
                    {errors.modelName && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.modelName.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      className={cn(
                        "block text-sm font-semibold mb-2",
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      )}
                    >
                      Deskripsi
                    </label>
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute left-3 top-3",
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        )}
                      >
                        <FileText size={20} />
                      </div>
                      <textarea
                        rows={4}
                        placeholder="Masukkan deskripsi model mobil (opsional)"
                        className={cn(
                          "w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 resize-none",
                          "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent",
                          errors.description
                            ? "border-red-500 bg-red-500/10"
                            : isDarkMode
                            ? "bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                            : "bg-white border-slate-300 text-slate-900 placeholder:text-gray-400"
                        )}
                        {...register("description")}
                      />
                    </div>
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Base Price */}
                  <div>
                    <label
                      className={cn(
                        "block text-sm font-semibold mb-2",
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      )}
                    >
                      Harga Dasar<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2",
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        )}
                      >
                        <DollarSign size={20} />
                      </div>
                      <input
                        type="text"
                        placeholder="0"
                        value={displayPrice}
                        onChange={handlePriceChange}
                        className={cn(
                          "w-full pl-10 pr-16 py-3 rounded-xl border transition-all duration-300",
                          "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent",
                          errors.basePrice
                            ? "border-red-500 bg-red-500/10"
                            : isDarkMode
                            ? "bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                            : "bg-white border-slate-300 text-slate-900 placeholder:text-gray-400"
                        )}
                      />
                      <div
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium",
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        )}
                      >
                        IDR
                      </div>
                    </div>
                    {errors.basePrice && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.basePrice.message}
                      </p>
                    )}
                  </div>

                  {/* Image URL */}
                  <div>
                    <label
                      className={cn(
                        "block text-sm font-semibold mb-2",
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      )}
                    >
                      URL Gambar
                    </label>
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2",
                          isDarkMode ? "text-slate-500" : "text-gray-400"
                        )}
                      >
                        <Link size={20} />
                      </div>
                      <input
                        type="text"
                        placeholder="https://example.com/car-image.jpg"
                        className={cn(
                          "w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300",
                          "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent",
                          errors.imageUrl
                            ? "border-red-500 bg-red-500/10"
                            : isDarkMode
                            ? "bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                            : "bg-white border-slate-300 text-slate-900 placeholder:text-gray-400"
                        )}
                        {...register("imageUrl")}
                      />
                    </div>
                    {errors.imageUrl && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.imageUrl.message}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      className={cn(
                        "block text-sm font-semibold mb-2",
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      )}
                    >
                      Status
                    </label>
                    <div
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border",
                        isDarkMode
                          ? "bg-slate-800/50 border-slate-700/50"
                          : "bg-slate-50 border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            watchIsActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-orange-500/20 text-orange-400"
                          )}
                        >
                          <ToggleLeft size={20} />
                        </div>
                        <div>
                          <p
                            className={cn(
                              "font-semibold",
                              isDarkMode ? "text-white" : "text-slate-900"
                            )}
                          >
                            {watchIsActive ? "Aktif" : "Tidak Aktif"}
                          </p>
                          <p
                            className={cn(
                              "text-xs",
                              isDarkMode ? "text-slate-400" : "text-slate-500"
                            )}
                          >
                            {watchIsActive
                              ? "Model mobil akan ditampilkan"
                              : "Model mobil akan disembunyikan"}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={watchIsActive}
                          onChange={(e) =>
                            setValue("isActive", e.target.checked)
                          }
                        />
                        <div
                          className={cn(
                            "w-11 h-6 rounded-full peer transition-colors",
                            "peer-checked:bg-cyan-500",
                            isDarkMode ? "bg-slate-600" : "bg-slate-300",
                            "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                            "after:bg-white after:rounded-full after:h-5 after:w-5",
                            "after:transition-all peer-checked:after:translate-x-5"
                          )}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Image Preview */}
            <div>
              <h2
                className={cn(
                  "text-lg font-bold mb-4 flex items-center gap-2",
                  isDarkMode ? "text-white" : "text-slate-900"
                )}
              >
                <ImageIcon size={20} className="text-cyan-400" />
                Preview Gambar
              </h2>
              <div
                className={cn(
                  "aspect-video rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden",
                  isDarkMode
                    ? "border-slate-700 bg-slate-800/30"
                    : "border-slate-300 bg-slate-50"
                )}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview(null)}
                  />
                ) : (
                  <div className="text-center p-6">
                    <Car
                      size={48}
                      className={cn(
                        "mx-auto mb-3",
                        isDarkMode ? "text-slate-600" : "text-slate-400"
                      )}
                    />
                    <p
                      className={cn(
                        "text-sm",
                        isDarkMode ? "text-slate-500" : "text-slate-400"
                      )}
                    >
                      Masukkan URL gambar untuk melihat preview
                    </p>
                  </div>
                )}
              </div>

              {/* Selected Brand Info */}
              {selectedBrand && (
                <div
                  className={cn(
                    "mt-4 p-4 rounded-xl",
                    isDarkMode ? "bg-slate-800/50" : "bg-slate-100"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-medium mb-2",
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    )}
                  >
                    Brand Terpilih:
                  </p>
                  <div className="flex items-center gap-3">
                    {selectedBrand.logo ? (
                      <img
                        src={selectedBrand.logo}
                        alt={selectedBrand.name}
                        className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                      />
                    ) : (
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                          "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                        )}
                      >
                        {selectedBrand.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p
                        className={cn(
                          "font-semibold",
                          isDarkMode ? "text-white" : "text-slate-900"
                        )}
                      >
                        {selectedBrand.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-8 border-t border-slate-700/50">
            <button
              type="button"
              onClick={handleReset}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold transition-all duration-200",
                isDarkMode
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              )}
            >
              Reset Form
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold transition-all duration-200",
                isDarkMode
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              )}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className={cn(
                "px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700",
                "rounded-xl font-semibold flex items-center justify-center gap-2",
                "transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              )}
            >
              {isSubmitting || loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Simpan Car Model
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
