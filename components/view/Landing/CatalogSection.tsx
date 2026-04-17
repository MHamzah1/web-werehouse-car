"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, MapPin, Fuel, Gauge, Calendar, Car,
  ChevronLeft, ChevronRight, Eye, ArrowRight,
} from "lucide-react";
import { instanceAxios } from "@/lib/axiosInstance/instanceAxios";
import { resolveMediaUrl } from "@/lib/media-url";

interface VehicleShowroom {
  id: string;
  name: string;
  city: string;
  province: string;
  whatsapp: string;
  address: string;
}

interface ListingVehicle {
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

interface PublicListingCard {
  id: string;
  vehicleId: string;
  listingTitle: string;
  askingPrice: number | string;
  isNegotiable: boolean;
  description: string | null;
  highlights?: string[];
  viewCount?: number;
  vehicle: ListingVehicle;
}

interface ShowroomOption {
  id: string;
  name: string;
  city: string;
}

const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatCurrency = (val: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(toNumber(val));

interface CatalogSectionProps {
  isFullPage?: boolean;
}

export default function CatalogSection({ isFullPage = false }: CatalogSectionProps) {
  const [vehicles, setVehicles] = useState<PublicListingCard[]>([]);
  const [showrooms, setShowrooms] = useState<ShowroomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    showroomId: "",
    page: 1,
    limit: isFullPage ? 12 : 6,
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

      const { data } = await instanceAxios.get("/public/listings", { params });
      setVehicles(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.totalRecords || 0);
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

  return (
    <section className="relative py-16 sm:py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-xs sm:text-sm font-bold border border-cyan-500/20 mb-4 sm:mb-6">
            <Car className="w-4 h-4" />
            Katalog Kendaraan
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4">
            Mobil{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Siap Jual
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base px-2">
            Semua kendaraan telah lolos inspeksi ketat dan siap untuk Anda miliki.
            {total > 0 && (
              <span className="text-cyan-400 font-bold"> {total} unit tersedia</span>
            )}
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl mb-8 sm:mb-10 max-w-3xl mx-auto border border-slate-700/50">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari merek, model, atau warna..."
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))
              }
              className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-800/80 text-white placeholder-slate-500 outline-none text-sm sm:text-base"
            />
          </div>
          <select
            value={filters.showroomId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, showroomId: e.target.value, page: 1 }))
            }
            className="px-4 py-3.5 sm:py-4 bg-slate-800/80 text-white border-t sm:border-t-0 sm:border-l border-slate-700/50 outline-none cursor-pointer text-sm sm:text-base appearance-none min-w-[160px]"
          >
            <option value="" className="bg-slate-800">Semua Cabang</option>
            {showrooms.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-800">
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setFilters((f) => ({ ...f, page: 1 }))}
            className="px-6 py-3.5 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:brightness-110 transition-all"
          >
            Cari
          </button>
        </div>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20">
            <Car className="w-16 h-16 sm:w-20 sm:h-20 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-base sm:text-lg font-semibold">
              Belum ada kendaraan tersedia saat ini.
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Silakan cek kembali nanti atau hubungi kami langsung.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-12 flex-wrap px-2">
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
                  disabled={filters.page <= 1}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-semibold text-sm bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - filters.page) <= 1
                  )
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    typeof p === "string" ? (
                      <span key={`dots-${i}`} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-500 text-sm">
                        {p}
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setFilters((f) => ({ ...f, page: p as number }))}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-semibold text-sm transition-all ${
                          filters.page === p
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-cyan-500/50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, f.page + 1) }))}
                  disabled={filters.page >= totalPages}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-semibold text-sm bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* View All CTA (homepage only) */}
            {!isFullPage && total > 6 && (
              <div className="text-center mt-8 sm:mt-10">
                <Link
                  href="/katalog"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-cyan-500/20 hover:brightness-110 hover:scale-[1.02] transition-all"
                >
                  Lihat Semua Katalog
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function VehicleCard({ vehicle: listing }: { vehicle: PublicListingCard }) {
  const vehicle = listing.vehicle;
  const imageUrl = resolveMediaUrl(vehicle.images?.[0]);
  const vehicleId = listing.vehicleId || vehicle.id;
  const displayTitle =
    listing.listingTitle?.trim() || `${vehicle.brandName} ${vehicle.modelName}`.trim();

  return (
    <Link
      href={`/vehicles/${vehicleId}`}
      className="group block rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${vehicle.brandName} ${vehicle.modelName}`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <Car className="w-12 h-12 sm:w-16 sm:h-16 text-slate-700" />
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1.5">
          {vehicle.condition && (
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-cyan-500 text-white text-[10px] sm:text-xs font-bold rounded-full">
              {vehicle.condition}
            </span>
          )}
        </div>

        {/* Showroom badge */}
        {vehicle.showroom && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-500 text-white text-[10px] sm:text-xs font-bold rounded-full">
              {vehicle.showroom.name.replace("K-CUNK MOTOR", "").trim() || "Pusat"}
            </span>
          </div>
        )}

        {/* Price badge */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
          <span className="px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs sm:text-sm rounded-lg sm:rounded-xl shadow-lg">
            {toNumber(listing.askingPrice) > 0
              ? formatCurrency(listing.askingPrice)
              : "Hubungi Kami"}
          </span>
        </div>

        {/* View icon */}
        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5">
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors truncate">
          {displayTitle}
        </h3>

        {/* Specs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
          <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-slate-800 text-slate-300">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {vehicle.year}
          </span>
          {vehicle.transmission && (
            <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-slate-800 text-slate-300">
              <Gauge className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {vehicle.transmission}
            </span>
          )}
          {vehicle.fuelType && (
            <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-slate-800 text-slate-300">
              <Fuel className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {vehicle.fuelType}
            </span>
          )}
        </div>

        {/* Location */}
        {vehicle.showroom && (
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 pt-2 sm:pt-3 border-t border-slate-800">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {vehicle.showroom.city}, {vehicle.showroom.province}
          </div>
        )}
      </div>
    </Link>
  );
}
