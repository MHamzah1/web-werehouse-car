"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AppDispatch, RootState } from "@/lib/state/store";
import { createYearPrice, bulkCreateYearPrices, clearSuccess, clearError } from "@/lib/state/slice/year-price/yearPriceSlice";
import { getBrandsForSelect } from "@/lib/state/slice/brand/brandSlice";
import { getCarModelsForSelect } from "@/lib/state/slice/car-models/CarModelsSlice";
import { getAllVariants } from "@/lib/state/slice/variant/variantSlice";
import { showAlert } from "@/components/feature/alert/alert";
import { FiSave, FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";

interface FormData {
  variantId: string;
  year: number;
  basePrice: number;
  isActive: boolean;
}

interface BulkPriceItem {
  year: number;
  basePrice: number;
}

const AddYearPrice = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, success, error } = useSelector((state: RootState) => state.yearPrice);
  const { data: brands } = useSelector((state: RootState) => state.brand);
  const { data: carModels } = useSelector((state: RootState) => state.CarModels);
  const { data: variants } = useSelector((state: RootState) => state.variant);

  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkPrices, setBulkPrices] = useState<BulkPriceItem[]>([
    { year: new Date().getFullYear(), basePrice: 0 }
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      year: new Date().getFullYear(),
      basePrice: 0,
      isActive: true,
    },
  });

  const selectedVariantId = watch("variantId");

  useEffect(() => {
    dispatch(getBrandsForSelect({ page: 1, perPage: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedBrandId) {
      dispatch(getCarModelsForSelect({ page: 1, perPage: 100, brandId: selectedBrandId }));
      setSelectedModelId("");
    }
  }, [selectedBrandId, dispatch]);

  useEffect(() => {
    if (selectedModelId) {
      dispatch(getAllVariants({ page: 1, perPage: 100, modelId: selectedModelId }));
    }
  }, [selectedModelId, dispatch]);

  useEffect(() => {
    if (success) {
      showAlert({ icon: "success", title: "Berhasil", text: "Year Price berhasil ditambahkan" });
      dispatch(clearSuccess());
      router.push("/MasterData/YearPrice/Table");
    }
    if (error) {
      showAlert({ icon: "error", title: "Error", text: error });
      dispatch(clearError());
    }
  }, [success, error, dispatch, router]);

  const onSubmit = (data: FormData) => {
    if (isBulkMode && selectedVariantId) {
      dispatch(bulkCreateYearPrices({
        variantId: selectedVariantId,
        prices: bulkPrices.filter(p => p.basePrice > 0),
      }));
    } else {
      dispatch(createYearPrice(data));
    }
  };

  const addBulkPriceRow = () => {
    const lastYear = bulkPrices[bulkPrices.length - 1]?.year || new Date().getFullYear();
    setBulkPrices([...bulkPrices, { year: lastYear - 1, basePrice: 0 }]);
  };

  const removeBulkPriceRow = (index: number) => {
    setBulkPrices(bulkPrices.filter((_, i) => i !== index));
  };

  const updateBulkPrice = (index: number, field: keyof BulkPriceItem, value: number) => {
    const updated = [...bulkPrices];
    updated[index][field] = value;
    setBulkPrices(updated);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tambah Year Price</h1>
          <p className="text-slate-500 dark:text-slate-400">Tambah harga dasar per tahun untuk variant</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setIsBulkMode(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !isBulkMode
                ? "bg-cyan-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            Single Entry
          </button>
          <button
            type="button"
            onClick={() => setIsBulkMode(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isBulkMode
                ? "bg-cyan-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            Bulk Entry
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Brand
              </label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
              >
                <option value="">Pilih Brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Model
              </label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                disabled={!selectedBrandId}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white disabled:opacity-50"
              >
                <option value="">Pilih Model</option>
                {carModels.map((model) => (
                  <option key={model.id} value={model.id}>{model.modelName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Variant *
              </label>
              <select
                {...register("variantId", { required: "Variant wajib dipilih" })}
                disabled={!selectedModelId}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white disabled:opacity-50"
              >
                <option value="">Pilih Variant</option>
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>{variant.variantName}</option>
                ))}
              </select>
              {errors.variantId && (
                <p className="text-red-500 text-sm mt-1">{errors.variantId.message}</p>
              )}
            </div>
          </div>

          {!isBulkMode ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tahun *
                </label>
                <input
                  type="number"
                  {...register("year", { 
                    required: "Tahun wajib diisi",
                    min: { value: 2000, message: "Tahun minimal 2000" },
                    max: { value: 2030, message: "Tahun maksimal 2030" },
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
                />
                {errors.year && (
                  <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Harga Dasar (Rp) *
                </label>
                <input
                  type="number"
                  {...register("basePrice", { 
                    required: "Harga dasar wajib diisi",
                    min: { value: 0, message: "Harga tidak boleh negatif" },
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
                  placeholder="Contoh: 150000000"
                />
                {errors.basePrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.basePrice.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  id="isActive"
                  className="w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Aktif
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900 dark:text-white">Daftar Harga per Tahun</h3>
                <button
                  type="button"
                  onClick={addBulkPriceRow}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm"
                >
                  <FiPlus className="w-4 h-4" />
                  Tambah Tahun
                </button>
              </div>

              <div className="space-y-3">
                {bulkPrices.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Tahun</label>
                      <input
                        type="number"
                        value={item.year}
                        onChange={(e) => updateBulkPrice(index, "year", parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-xs text-slate-500 mb-1">Harga Dasar (Rp)</label>
                      <input
                        type="number"
                        value={item.basePrice}
                        onChange={(e) => updateBulkPrice(index, "basePrice", parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:text-white"
                        placeholder="150000000"
                      />
                    </div>
                    <div className="flex-shrink-0 pt-5">
                      <button
                        type="button"
                        onClick={() => removeBulkPriceRow(index)}
                        disabled={bulkPrices.length === 1}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddYearPrice;
