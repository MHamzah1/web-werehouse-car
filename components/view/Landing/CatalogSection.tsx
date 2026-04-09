"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Fuel, Gauge, Calendar, Car, ChevronLeft, ChevronRight } from "lucide-react";
import { instanceAxios } from "@/lib/axiosInstance/instanceAxios";

interface VehicleShowroom {
  id: string;
  name: string;
  city: string;
  province: string;
  whatsapp: string;
  address: string;
}

interface Vehicle {
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

interface ShowroomOption {
  id: string;
  name: string;
  city: string;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

export default function CatalogSection() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showrooms, setShowrooms] = useState<ShowroomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    showroomId: "",
    page: 1,
    limit: 6,
  });

  const fetchShowrooms = async () => {
    try {
      const { data } = await instanceAxios.get("/public/showrooms");
      setShowrooms(data);
    } catch {
      // silent
    }
  };

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: filters.page,
        limit: filters.limit,
      };
      if (filters.search) params.search = filters.search;
      if (filters.showroomId) params.showroomId = filters.showroomId;

      const { data } = await instanceAxios.get("/public/vehicles", { params });
      setVehicles(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchShowrooms();
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
  };

  return (
    <section id="katalog" className="relative py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#070c18] to-[#020617]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium border border-orange-500/20 mb-4">
            Katalog Kendaraan
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Mobil{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Siap Jual
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Semua kendaraan telah lolos inspeksi dan siap untuk Anda miliki.
            {total > 0 && (
              <span className="text-orange-400 font-semibold"> {total} unit tersedia</span>
            )}
          </p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-10 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Cari merek, model, atau warna..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
              className="w-full pl-12 pr-4 py-3.5 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
            />
          </div>
          <select
            value={filters.showroomId}
            onChange={(e) => setFilters((f) => ({ ...f, showroomId: e.target.value, page: 1 }))}
            className="px-4 py-3.5 bg-white/[0.05] border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="" className="bg-[#0b0f19]">Semua Cabang</option>
            {showrooms.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0b0f19]">
                {s.name}
              </option>
            ))}
          </select>
        </form>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20">
            <Car className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Belum ada kendaraan tersedia saat ini.</p>
            <p className="text-gray-500 text-sm mt-2">Silakan cek kembali nanti atau hubungi kami langsung.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
                  disabled={filters.page <= 1}
                  className="p-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white hover:border-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-gray-400 px-4">
                  Halaman <span className="text-white font-bold">{filters.page}</span> dari{" "}
                  <span className="text-white font-bold">{totalPages}</span>
                </span>
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, f.page + 1) }))}
                  disabled={filters.page >= totalPages}
                  className="p-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white hover:border-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const imageUrl = vehicle.images?.[0];

  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="group block rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:border-orange-500/30 hover:bg-white/[0.05] transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-gray-900 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${vehicle.brandName} ${vehicle.modelName}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Car className="w-16 h-16 text-gray-700" />
          </div>
        )}
        {vehicle.showroom && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 text-xs font-medium bg-black/60 backdrop-blur-sm text-white rounded-full border border-white/10">
              {vehicle.showroom.name}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
          {vehicle.brandName} {vehicle.modelName}
        </h3>

        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {vehicle.year}
          </span>
          {vehicle.transmission && (
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              {vehicle.transmission}
            </span>
          )}
          {vehicle.fuelType && (
            <span className="flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5" />
              {vehicle.fuelType}
            </span>
          )}
          {vehicle.mileage > 0 && (
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              {vehicle.mileage.toLocaleString("id-ID")} km
            </span>
          )}
        </div>

        {vehicle.color && (
          <p className="text-xs text-gray-500 mb-3">Warna: {vehicle.color}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <div>
            <p className="text-xs text-gray-500">Harga</p>
            <p className="text-lg font-black text-orange-400">
              {vehicle.askingPrice > 0 ? formatCurrency(vehicle.askingPrice) : "Hubungi Kami"}
            </p>
          </div>
          {vehicle.showroom && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              {vehicle.showroom.city}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
