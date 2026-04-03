"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AppDispatch, RootState } from "@/lib/state/store";
import { createVariant, clearSuccess, clearError } from "@/lib/state/slice/variant/variantSlice";
import { getBrandsForSelect } from "@/lib/state/slice/brand/brandSlice";
import { getCarModelsForSelect } from "@/lib/state/slice/car-models/CarModelsSlice";
import { showAlert } from "@/components/feature/alert/alert";
import { FiSave, FiArrowLeft } from "react-icons/fi";

interface FormData {
  modelId: string;
  variantName: string;
  variantCode: string;
  description?: string;
  transmissionType: "matic" | "manual" | "both";
  sortOrder: number;
  isActive: boolean;
}

const AddVariant = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, success, error } = useSelector((state: RootState) => state.variant);
  const { data: brands } = useSelector((state: RootState) => state.brand);
  const { data: carModels } = useSelector((state: RootState) => state.CarModels);

  const [selectedBrandId, setSelectedBrandId] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      transmissionType: "both",
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    dispatch(getBrandsForSelect({ page: 1, perPage: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedBrandId) {
      dispatch(getCarModelsForSelect({ page: 1, perPage: 100, brandId: selectedBrandId }));
    }
  }, [selectedBrandId, dispatch]);

  useEffect(() => {
    if (success) {
      showAlert({ icon: "success", title: "Berhasil", text: "Variant berhasil ditambahkan" });
      dispatch(clearSuccess());
      router.push("/MasterData/Variant/Table");
    }
    if (error) {
      showAlert({ icon: "error", title: "Error", text: error });
      dispatch(clearError());
    }
  }, [success, error, dispatch, router]);

  const onSubmit = (data: FormData) => {
    dispatch(createVariant(data));
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tambah Variant</h1>
          <p className="text-slate-500 dark:text-slate-400">Tambah data variant/tipe mobil baru</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
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
                Model Mobil *
              </label>
              <select
                {...register("modelId", { required: "Model wajib dipilih" })}
                disabled={!selectedBrandId}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white disabled:opacity-50"
              >
                <option value="">Pilih Model</option>
                {carModels.map((model) => (
                  <option key={model.id} value={model.id}>{model.modelName}</option>
                ))}
              </select>
              {errors.modelId && (
                <p className="text-red-500 text-sm mt-1">{errors.modelId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nama Variant *
              </label>
              <input
                type="text"
                {...register("variantName", { required: "Nama variant wajib diisi" })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
                placeholder="Contoh: G, Veloz, VRZ"
              />
              {errors.variantName && (
                <p className="text-red-500 text-sm mt-1">{errors.variantName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Kode Variant *
              </label>
              <input
                type="text"
                {...register("variantCode", { required: "Kode variant wajib diisi" })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
                placeholder="Contoh: AVZ-G, FTN-VRZ"
              />
              {errors.variantCode && (
                <p className="text-red-500 text-sm mt-1">{errors.variantCode.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tipe Transmisi *
              </label>
              <select
                {...register("transmissionType", { required: "Tipe transmisi wajib dipilih" })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
              >
                <option value="both">Both (Matic & Manual)</option>
                <option value="matic">Matic</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Urutan Tampilan
              </label>
              <input
                type="number"
                {...register("sortOrder", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
                defaultValue={0}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Deskripsi
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-slate-800 dark:text-white"
                placeholder="Deskripsi variant..."
              />
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

export default AddVariant;
