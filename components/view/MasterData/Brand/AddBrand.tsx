/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Tag,
  FileText,
  Link,
  ToggleLeft,
  Image as ImageIcon,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { AppDispatch, RootState } from "@/lib/state/store";
import { createBrand } from "@/lib/state/slice/brand/brandSlice";
import Alert from "@/components/feature/alert/alert";
import { cn } from "@/lib/utils";
import { TextField, TextArea, Switch } from "@/components/ui";

// ============================================
// Validation Schema
// ============================================
const brandSchema = z.object({
  name: z
    .string()
    .min(1, "Nama brand wajib diisi")
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional(),
  logo: z.string().url("Format URL tidak valid").optional().or(z.literal("")),
  isActive: z.boolean(),
});

type BrandFormData = z.infer<typeof brandSchema>;

// ============================================
// Component
// ============================================
export default function AddBrand() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const { loading } = useSelector((state: RootState) => state.brand);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      description: "",
      logo: "",
      isActive: true,
    },
  });

  const watchLogo = watch("logo");
  const watchIsActive = watch("isActive");

  // Update logo preview when URL changes
  React.useEffect(() => {
    if (watchLogo && watchLogo.length > 0) {
      setLogoPreview(watchLogo);
    } else {
      setLogoPreview(null);
    }
  }, [watchLogo]);

  // ============================================
  // Handlers
  // ============================================
  const onSubmit = async (data: BrandFormData) => {
    const confirmed = await Alert.confirmSave(
      "Simpan Brand Baru?",
      "Apakah Anda yakin ingin menyimpan brand baru ini?"
    );

    if (!confirmed) return;

    try {
      Alert.loading("Menyimpan data...");

      const payload = {
        name: data.name,
        description: data.description || null,
        logo: data.logo || null,
        isActive: data.isActive,
      };

      await dispatch(createBrand(payload)).unwrap();

      Alert.closeLoading();
      await Alert.success("Berhasil!", "Brand baru berhasil ditambahkan");
      router.push("/MasterData/Brand/Table");
    } catch (error: any) {
      Alert.closeLoading();
      await Alert.error(
        "Gagal!",
        error?.message || "Gagal menambahkan brand baru"
      );
    }
  };

  const handleCancel = async () => {
    const confirmed = await Alert.confirmDiscard();
    if (confirmed) {
      router.push("/MasterData/Brand/Table");
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
      setLogoPreview(null);
      Alert.toast.info("Form berhasil direset");
    }
  };

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
              Tambah Brand Baru
            </h1>
            <p
              className={cn(
                "text-sm mt-1",
                isDarkMode ? "text-slate-400" : "text-slate-600"
              )}
            >
              Isi form di bawah untuk menambahkan brand baru
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
              {/* Section: Informasi Brand */}
              <div>
                <h2
                  className={cn(
                    "text-lg font-bold mb-4 flex items-center gap-2",
                    isDarkMode ? "text-white" : "text-slate-900"
                  )}
                >
                  <Tag size={20} className="text-cyan-400" />
                  Informasi Brand
                </h2>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label
                      className={cn(
                        "block text-sm font-semibold mb-2",
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      )}
                    >
                      Nama Brand<span className="text-red-500 ml-1">*</span>
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
                      <input
                        type="text"
                        placeholder="Masukkan nama brand"
                        className={cn(
                          "w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300",
                          "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent",
                          errors.name
                            ? "border-red-500 bg-red-500/10"
                            : isDarkMode
                            ? "bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                            : "bg-white border-slate-300 text-slate-900 placeholder:text-gray-400"
                        )}
                        {...register("name")}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.name.message}
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
                        placeholder="Masukkan deskripsi brand (opsional)"
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

                  {/* Logo URL */}
                  <div>
                    <label
                      className={cn(
                        "block text-sm font-semibold mb-2",
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      )}
                    >
                      URL Logo
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
                        placeholder="https://example.com/logo.png"
                        className={cn(
                          "w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300",
                          "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent",
                          errors.logo
                            ? "border-red-500 bg-red-500/10"
                            : isDarkMode
                            ? "bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                            : "bg-white border-slate-300 text-slate-900 placeholder:text-gray-400"
                        )}
                        {...register("logo")}
                      />
                    </div>
                    {errors.logo && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <span>⚠</span> {errors.logo.message}
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
                              ? "Brand akan ditampilkan"
                              : "Brand akan disembunyikan"}
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

            {/* Right Column - Logo Preview */}
            <div>
              <h2
                className={cn(
                  "text-lg font-bold mb-4 flex items-center gap-2",
                  isDarkMode ? "text-white" : "text-slate-900"
                )}
              >
                <ImageIcon size={20} className="text-cyan-400" />
                Preview Logo
              </h2>
              <div
                className={cn(
                  "aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden",
                  isDarkMode
                    ? "border-slate-700 bg-slate-800/30"
                    : "border-slate-300 bg-slate-50"
                )}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-full h-full object-contain p-4"
                    onError={() => setLogoPreview(null)}
                  />
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon
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
                      Masukkan URL logo untuk melihat preview
                    </p>
                  </div>
                )}
              </div>
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
                  Simpan Brand
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
