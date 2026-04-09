"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Calendar, Gauge, Fuel, MapPin, Phone, Car,
  ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { instanceAxios } from "@/lib/axiosInstance/instanceAxios";

interface VehicleShowroom {
  id: string;
  name: string;
  city: string;
  province: string;
  phone: string | null;
  whatsapp: string | null;
  address: string;
}

interface VehicleDetail {
  id: string;
  brandName: string;
  modelName: string;
  year: number;
  color: string | null;
  transmission: string | null;
  fuelType: string | null;
  mileage: number;
  askingPrice: number;
  images: string[];
  description: string | null;
  condition: string | null;
  showroom: VehicleShowroom | null;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

export default function VehicleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await instanceAxios.get(`/public/vehicles/${id}`);
        setVehicle(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const openWhatsApp = () => {
    if (!vehicle?.showroom?.whatsapp) return;
    const phone = vehicle.showroom.whatsapp.startsWith("62")
      ? vehicle.showroom.whatsapp
      : `62${vehicle.showroom.whatsapp.replace(/^0/, "")}`;
    const message = encodeURIComponent(
      `Halo ${vehicle.showroom.name}, saya tertarik dengan mobil *${vehicle.brandName} ${vehicle.modelName} ${vehicle.year}*${vehicle.color ? ` warna ${vehicle.color}` : ""}. Apakah masih tersedia?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
        <div className="text-center">
          <Car className="w-20 h-20 text-gray-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Kendaraan Tidak Ditemukan</h1>
          <p className="text-gray-400 mb-6">Kendaraan ini mungkin sudah terjual atau tidak tersedia.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all"
          >
            <ArrowLeft size={18} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const images = vehicle.images?.length > 0 ? vehicle.images : [];

  const specs = [
    { label: "Tahun", value: vehicle.year, icon: Calendar },
    { label: "Transmisi", value: vehicle.transmission || "-", icon: Gauge },
    { label: "Bahan Bakar", value: vehicle.fuelType || "-", icon: Fuel },
    { label: "Kilometer", value: vehicle.mileage > 0 ? `${vehicle.mileage.toLocaleString("id-ID")} km` : "-", icon: Gauge },
    { label: "Warna", value: vehicle.color || "-", icon: Car },
    { label: "Kondisi", value: vehicle.condition || "Baik", icon: Car },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/#katalog"
            className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Kembali</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">KC</span>
            </div>
            <span className="text-sm font-bold text-white hidden sm:inline">K-CUNK MOTOR</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-3">
            {/* Main Image */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-900 mb-4">
              {images.length > 0 ? (
                <>
                  <Image
                    src={images[activeImage]}
                    alt={`${vehicle.brandName} ${vehicle.modelName}`}
                    fill
                    className="object-cover cursor-pointer"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    onClick={() => setLightboxOpen(true)}
                    priority
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImage((p) => (p === 0 ? images.length - 1 : p - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setActiveImage((p) => (p === images.length - 1 ? 0 : p + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs backdrop-blur-sm">
                    {activeImage + 1} / {images.length}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car className="w-24 h-24 text-gray-700" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === activeImage
                        ? "border-orange-500 opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Specs */}
            <div className="mt-8 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <h3 className="text-lg font-bold mb-4">Spesifikasi</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {specs.map((s) => (
                  <div key={s.label} className="flex items-start gap-3">
                    <s.icon className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className="text-sm font-medium text-white">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="mt-6 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="text-lg font-bold mb-3">Deskripsi</h3>
                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">
                  {vehicle.description}
                </p>
              </div>
            )}
          </div>

          {/* Right: Price & Contact */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h1 className="text-2xl sm:text-3xl font-black mb-2">
                  {vehicle.brandName} {vehicle.modelName}
                </h1>
                <p className="text-gray-400 text-sm mb-6">
                  {vehicle.year} &middot; {vehicle.transmission || "-"} &middot; {vehicle.color || "-"}
                </p>

                <div className="mb-6">
                  <p className="text-xs text-gray-500 mb-1">Harga</p>
                  <p className="text-3xl font-black text-orange-400">
                    {vehicle.askingPrice > 0
                      ? formatCurrency(vehicle.askingPrice)
                      : "Hubungi Kami"}
                  </p>
                </div>

                <button
                  onClick={openWhatsApp}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-3"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Hubungi via WhatsApp
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Tanyakan ketersediaan &amp; negosiasi langsung
                </p>
              </div>

              {/* Showroom Info */}
              {vehicle.showroom && (
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <h3 className="text-base font-bold mb-4">Lokasi Showroom</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">KC</span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{vehicle.showroom.name}</p>
                        <p className="text-xs text-gray-500">
                          {vehicle.showroom.city}, {vehicle.showroom.province}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                      <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {vehicle.showroom.address}
                      </p>
                    </div>

                    {vehicle.showroom.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <p className="text-xs text-gray-400">+{vehicle.showroom.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
          <button
            onClick={() => setActiveImage((p) => (p === 0 ? images.length - 1 : p - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="relative w-full max-w-5xl aspect-[16/10] mx-4">
            <Image
              src={images[activeImage]}
              alt={`Foto ${activeImage + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <button
            onClick={() => setActiveImage((p) => (p === images.length - 1 ? 0 : p + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {activeImage + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button (Mobile) */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40">
        <button
          onClick={openWhatsApp}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl shadow-green-500/30 flex items-center justify-center hover:scale-110 transition-transform"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
