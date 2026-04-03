"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { AppDispatch, RootState } from "@/lib/state/store";
import { getYearPriceById, updateYearPrice, clearSuccess, clearError, clearSelectedYearPrice } from "@/lib/state/slice/year-price/yearPriceSlice";
import { showAlert } from "@/components/feature/alert/alert";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import { decryptSlug } from "@/lib/slug/slug";

interface FormData {
  basePrice: number;
  isActive: boolean;
}

const EditYearPrice = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const id = decryptSlug(params.slug as string);

  const { selectedYearPrice, loading, success, error } = useSelector((state: RootState) => state.yearPrice);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>();

  useEffect(() => {
    if (id) {
      dispatch(getYearPriceById(id));
    }
    return () => {
      dispatch(clearSelectedYearPrice());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedYearPrice) {
      setValue("basePrice", Number(selectedYearPrice.basePrice));
      setValue("isActive", selectedYearPrice.isActive);
    }
  }, [selectedYearPrice, setValue]);

  useEffect(() => {
    if (success) {
      showAlert({ icon: "success", title: "Berhasil", text: "Year Price berhasil diupdate" });
      dispatch(clearSuccess());
      router.push("/MasterData/YearPrice/Table");
    }
    if (error) {
      showAlert({ icon: "error", title: "Error", text: error });
      dispatch(clearError());
    }
  }, [success, error, dispatch, router]);

  const onSubmit = (data: FormData) => {
    if (id) {
      dispatch(updateYearPrice({ id, yearPriceData: data }));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (!selectedYearPrice && loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Year Price</h1>
          <p className="text-slate-500 dark:text-slate-400">Edit harga dasar untuk variant</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
        {selectedYearPrice && (
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Informasi Variant</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Variant:</span>
                <p className="font-medium">{(selectedYearPrice as any).variant?.variantName || "-"}</p>
              </div>
              <div>
                <span className="text-slate-500">Model:</span>
                <p className="font-medium">
                  {(selectedYearPrice as any).variant?.model?.brand?.name} {(selectedYearPrice as any).variant?.model?.modelName}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Tahun:</span>
                <p className="font-medium">{selectedYearPrice.year}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
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
              />
              {errors.basePrice && (
                <p className="text-red-500 text-sm mt-1">{errors.basePrice.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-8">
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

export default EditYearPrice;
