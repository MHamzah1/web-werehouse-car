"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Moon,
  Sun,
  MapPlus,
} from "lucide-react";
import Link from "next/link";
import { createUsers } from "@/lib/state/slice/user/userSlice";
import { AppDispatch, RootState } from "@/lib/state/store";
import { useTheme } from "@/context/ThemeContext";

// Schema validasi dengan Zod
const registerSchema = z
  .object({
    fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    email: z.string().email("Email tidak valid").min(1, "Email wajib diisi"),
    phoneNumber: z
      .string()
      .min(8, "Nomor telepon minimal 8 digit (tanpa +62)")
      .max(13, "Nomor telepon maksimal 13 digit (tanpa +62)")
      .regex(/^[0-9]+$/, "Nomor telepon hanya boleh angka"),
    whatsappNumber: z
      .string()
      .min(8, "Nomor WhatsApp minimal 8 digit (tanpa +62)")
      .max(13, "Nomor WhatsApp maksimal 13 digit (tanpa +62)")
      .regex(/^[0-9]+$/, "Nomor WhatsApp hanya boleh angka"),
    location: z.string().min(3, "Lokasi minimal 3 karakter"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung huruf besar")
      .regex(/[0-9]/, "Password harus mengandung angka"),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "Anda harus menyetujui syarat dan ketentuan",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

// helper normalisasi nomor Indonesia
const normalizeTo62 = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) return `${digits}`;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return `62${digits}`;
};

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterComponent = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, success, error } = useSelector(
    (state: RootState) => state.Users,
  );

  // Gunakan useTheme hook dari context
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  // Handle success
  useEffect(() => {
    if (success) {
      toast.success("Registrasi berhasil! Silakan login");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    }
  }, [success, router]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: normalizeTo62(data.phoneNumber),
        whatsappNumber: normalizeTo62(data.whatsappNumber),
        location: data.location,
      };
      await dispatch(createUsers(payload)).unwrap();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err || "Registrasi gagal, silakan coba lagi");
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;

    const levels = [
      { strength: 1, label: "Lemah", color: "bg-red-500" },
      { strength: 2, label: "Cukup", color: "bg-orange-500" },
      { strength: 3, label: "Baik", color: "bg-yellow-500" },
      { strength: 4, label: "Kuat", color: "bg-green-500" },
      { strength: 5, label: "Sangat Kuat", color: "bg-green-600" },
    ];

    return levels[strength - 1] || levels[0];
  };

  const passwordStrength = getPasswordStrength(password || "");

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 p-4 py-12 ${
        isDarkMode
          ? "bg-linear-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-linear-to-br from-purple-50 via-white to-blue-50"
      }`}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 ${
          isDarkMode
            ? "bg-gray-800 hover:bg-gray-700"
            : "bg-white hover:bg-gray-50"
        }`}
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>

      <div className="w-full max-w-2xl">
        {/* Card Container */}
        <div
          className={`rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-300 hover:shadow-3xl ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            {/* <div className="flex justify-center mb-2">
              <MediatorLogo />
            </div> */}
            <h1 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Buat Akun Baru
            </h1>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Lengkapi informasi di bawah untuk mendaftar
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-blue-600 text-white"
                    : isDarkMode
                      ? "bg-gray-600 text-gray-400"
                      : "bg-gray-300 text-gray-600"
                }`}
              >
                1
              </div>
              <div
                className={`w-16 h-1 ${
                  step >= 2
                    ? "bg-blue-600"
                    : isDarkMode
                      ? "bg-gray-600"
                      : "bg-gray-300"
                }`}
              ></div>
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2
                  ? "bg-blue-600 text-white"
                  : isDarkMode
                    ? "bg-gray-600 text-gray-400"
                    : "bg-gray-300 text-gray-600"
              }`}
            >
              2
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                {/* Full Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="fullName"
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      {...register("fullName")}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                      } ${errors.fullName ? "border-red-500" : ""}`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      {...register("email")}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                      } ${errors.email ? "border-red-500" : ""}`}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label
                    htmlFor="phoneNumber"
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Nomor Telepon
                  </label>
                  <div className="flex">
                    <span
                      className={`inline-flex items-center px-3 rounded-l-lg border border-r-0 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-gray-300"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                      }`}
                    >
                      +62
                    </span>
                    <input
                      id="phoneNumber"
                      type="tel"
                      inputMode="numeric"
                      {...register("phoneNumber")}
                      className={`w-full px-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                      } ${errors.phoneNumber ? "border-red-500" : ""}`}
                      placeholder="8123456789"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* WhatsApp Number */}
                <div className="space-y-2">
                  <label
                    htmlFor="whatsappNumber"
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Nomor WhatsApp
                  </label>
                  <div className="flex">
                    <span
                      className={`inline-flex items-center px-3 rounded-l-lg border border-r-0 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-gray-300"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                      }`}
                    >
                      +62
                    </span>
                    <input
                      id="whatsappNumber"
                      type="tel"
                      inputMode="numeric"
                      {...register("whatsappNumber")}
                      className={`w-full px-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                      } ${errors.whatsappNumber ? "border-red-500" : ""}`}
                      placeholder="81234567890"
                    />
                  </div>
                  {errors.whatsappNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.whatsappNumber.message}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label
                    htmlFor="location"
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Lokasi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPlus className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="location"
                      type="text"
                      {...register("location")}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                      } ${errors.location ? "border-red-500" : ""}`}
                      placeholder="Jakarta Selatan"
                    />
                  </div>
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.location.message}
                    </p>
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 px-4 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Lanjut
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                {/* Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                      } ${errors.password ? "border-red-500" : ""}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff
                          className={`h-5 w-5 ${
                            isDarkMode
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        />
                      ) : (
                        <Eye
                          className={`h-5 w-5 ${
                            isDarkMode
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        />
                      )}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex-1 h-2 rounded-full overflow-hidden ${
                            isDarkMode ? "bg-gray-600" : "bg-gray-200"
                          }`}
                        >
                          <div
                            className={`h-full ${passwordStrength.color} transition-all duration-300`}
                            style={{
                              width: `${
                                (passwordStrength.strength / 5) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className={`block text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                      } ${errors.confirmPassword ? "border-red-500" : ""}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          className={`h-5 w-5 ${
                            isDarkMode
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        />
                      ) : (
                        <Eye
                          className={`h-5 w-5 ${
                            isDarkMode
                              ? "text-gray-400 hover:text-gray-300"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-2">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      {...register("agreeToTerms")}
                      className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span
                      className={`ml-2 text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Saya setuju dengan{" "}
                      <Link
                        href="/terms"
                        className={`font-medium ${
                          isDarkMode
                            ? "text-purple-400 hover:text-purple-300"
                            : "text-purple-600 hover:text-purple-700"
                        }`}
                      >
                        Syarat dan Ketentuan
                      </Link>{" "}
                      serta{" "}
                      <Link
                        href="/privacy"
                        className={`font-medium ${
                          isDarkMode
                            ? "text-purple-400 hover:text-purple-300"
                            : "text-purple-600 hover:text-purple-700"
                        }`}
                      >
                        Kebijakan Privasi
                      </Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="text-red-500 text-sm">
                      {errors.agreeToTerms.message}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`flex-1 py-3 px-4 border-2 font-semibold rounded-lg transition-all duration-200 ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-3"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Memproses...
                      </span>
                    ) : (
                      "Daftar"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div
                className={`w-full border-t ${
                  isDarkMode ? "border-gray-600" : "border-gray-300"
                }`}
              ></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className={`px-2 ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-400"
                    : "bg-white text-gray-500"
                }`}
              >
                Sudah punya akun?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              href="/auth/login"
              className={`font-semibold ${
                isDarkMode
                  ? "text-purple-400 hover:text-purple-300"
                  : "text-purple-600 hover:text-purple-700"
              }`}
            >
              Masuk di sini
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p
          className={`text-center text-sm mt-6 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          © 2024 Market Place Mediator. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default RegisterComponent;
