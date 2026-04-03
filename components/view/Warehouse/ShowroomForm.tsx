"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/state/store";
import {
  createShowroom,
  clearError,
  clearSuccess,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import PhoneInputField from "@/components/ui/phone-input-field";

const ShowroomForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { actionLoading, error, successMessage } = useSelector(
    (state: RootState) => state.warehouse,
  );

  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    province: "",
    phone: "62",
    whatsapp: "62",
  });

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccess());
      router.push("/warehouse/showrooms");
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createShowroom(form));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/warehouse/showrooms"
          className={`p-2 rounded-xl transition-colors ${isDark ? "bg-slate-800/50 hover:bg-slate-800 text-slate-400" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`}
        >
          <FiArrowLeft className="text-xl" />
        </Link>
        <div>
          <h1
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Tambah Showroom
          </h1>
          <p
            className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Buat showroom baru
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`${isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-sm"} border rounded-2xl p-6 space-y-4`}
      >
        {[
          {
            label: "Nama Showroom",
            name: "name",
            placeholder: "Contoh: Showroom Jakarta Selatan",
            required: true,
          },
          {
            label: "Kode Showroom",
            name: "code",
            placeholder: "Contoh: SRM-JKT01",
            required: true,
          },
          {
            label: "Kota",
            name: "city",
            placeholder: "Jakarta Selatan",
            required: true,
          },
          {
            label: "Provinsi",
            name: "province",
            placeholder: "DKI Jakarta",
            required: true,
          },
          {
            label: "Telepon",
            name: "phone",
            placeholder: "021-12345678",
            isPhone: true,
          },
          {
            label: "WhatsApp",
            name: "whatsapp",
            placeholder: "08123456789",
            isPhone: true,
          },
        ].map((field) => (
          <div key={field.name}>
            {(field as any).isPhone ? (
              <PhoneInputField
                label={field.label}
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                placeholder="8123456789"
                required={field.required}
              />
            ) : (
              <>
                <label
                  className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  {field.label}
                </label>
                <input
                  type="text"
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent text-sm`}
                />
              </>
            )}
          </div>
        ))}

        <div>
          <label
            className={`block text-sm font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}
          >
            Alamat Lengkap
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Jl. Contoh No. 123"
            required
            rows={3}
            className={`w-full px-4 py-2.5 ${isDark ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent text-sm resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={actionLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <FiSave /> Simpan Showroom
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ShowroomForm;
