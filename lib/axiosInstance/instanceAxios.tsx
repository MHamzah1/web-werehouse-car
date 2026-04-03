// src/lib/axiosInstance/instanceAxios.js
import axios from "axios";
import Cookies from "js-cookie";

// Wajib mengarah ke /api
const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.247:8080/api";

export const instanceAxios = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tambahkan Authorization otomatis
instanceAxios.interceptors.request.use((config) => {
  try {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

// Standardized Error
instanceAxios.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject({
      status: err.response?.status || 500,
      message:
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Terjadi kesalahan di server",
    });
  },
);

export default instanceAxios;
