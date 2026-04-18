"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Gauge,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { instanceAxios } from "@/lib/axiosInstance/instanceAxios";
import {
  resolveMediaUrl,
  shouldBypassImageOptimization,
} from "@/lib/media-url";

interface VehicleShowroom {
  id: string;
  name: string;
  city: string;
  province: string;
  whatsapp: string;
  address: string;
}

interface ListingVehicleVariant {
  variantName: string | null;
  transmissionType?: string | null;
}

interface ListingVehicle {
  id: string;
  variantId?: string | null;
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
  bodyStyle?: string | null;
  variant?: ListingVehicleVariant | null;
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

const formatTransmissionLabel = (value: string | null | undefined) => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return "—";
  if (normalized === "matic") return "Matic";
  if (normalized === "manual") return "Manual";
  if (normalized === "both") return "Manual / Matic";
  return value!.trim();
};

const formatMileageLabel = (value: number | null | undefined) => {
  const mileage = typeof value === "number" ? value : 0;
  return `${mileage.toLocaleString("id-ID")} km`;
};

const buildVehicleTitle = (vehicle: ListingVehicle) => {
  const parts = [
    vehicle.brandName?.trim(),
    vehicle.modelName?.trim(),
    vehicle.variant?.variantName?.trim(),
    vehicle.year ? String(vehicle.year) : null,
  ].filter((part): part is string => Boolean(part));

  return parts.join(" ");
};

const variantCache = new Map<string, ListingVehicleVariant>();

const enrichListingsWithVariants = async (items: PublicListingCard[]) => {
  const missingVariantIds = Array.from(
    new Set(
      items
        .map((item) => item.vehicle?.variantId)
        .filter((id): id is string => Boolean(id) && !variantCache.has(id)),
    ),
  );

  if (missingVariantIds.length > 0) {
    await Promise.all(
      missingVariantIds.map(async (variantId) => {
        try {
          const { data } = await instanceAxios.get(`/variants/${variantId}`);
          variantCache.set(variantId, {
            variantName: data?.variantName ?? null,
            transmissionType: data?.transmissionType ?? null,
          });
        } catch {
          variantCache.set(variantId, {
            variantName: null,
            transmissionType: null,
          });
        }
      }),
    );
  }

  return items.map((item) => {
    const cachedVariant = item.vehicle?.variantId
      ? variantCache.get(item.vehicle.variantId)
      : null;

    return {
      ...item,
      vehicle: {
        ...item.vehicle,
        variant: item.vehicle.variant || cachedVariant || null,
      },
    };
  });
};

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
      const enrichedVehicles = await enrichListingsWithVariants(data.data || []);
      setVehicles(enrichedVehicles);
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
    <section className="relative bg-white py-16 sm:py-20 md:py-24">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-kcunk-red mb-3">
            Koleksi Pilihan
          </p>
          <h2 className="kcunk-heading text-3xl sm:text-4xl md:text-5xl text-kcunk-ink mb-4">
            Our Featured Cars
          </h2>
          <p className="text-sm sm:text-base text-kcunk-slate max-w-2xl mx-auto">
            K-Cunk Motor menghadirkan koleksi mobil bekas berkualitas dengan
            proses transparan. Semua unit telah lolos inspeksi 50+ titik
            pengecekan.
            {total > 0 && (
              <span className="block mt-2 text-kcunk-red font-bold">
                {total} unit tersedia
              </span>
            )}
          </p>
        </div>

        {/* Filter Bar — only on full page */}
        {isFullPage && (
          <div className="flex flex-col sm:flex-row items-stretch bg-white rounded-sm shadow-lg border border-kcunk-line overflow-hidden mb-10 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-kcunk-muted" />
              <input
                type="text"
                placeholder="Cari merek, model, atau warna..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))
                }
                className="w-full pl-11 pr-4 py-3.5 text-sm text-kcunk-ink placeholder-kcunk-muted outline-none"
              />
            </div>
            <select
              value={filters.showroomId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, showroomId: e.target.value, page: 1 }))
              }
              className="px-4 py-3.5 text-sm text-kcunk-ink bg-kcunk-surface border-t sm:border-t-0 sm:border-l border-kcunk-line outline-none cursor-pointer min-w-[180px]"
            >
              <option value="">Semua Cabang</option>
              {showrooms.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setFilters((f) => ({ ...f, page: 1 }))}
              className="px-7 py-3.5 bg-kcunk-red hover:bg-kcunk-red-dark text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Cari
            </button>
          </div>
        )}

        {/* Vehicle Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-kcunk-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20">
            <Car className="w-16 h-16 sm:w-20 sm:h-20 text-kcunk-line mx-auto mb-4" />
            <p className="text-kcunk-ink text-base sm:text-lg font-semibold">
              Belum ada kendaraan tersedia saat ini.
            </p>
            <p className="text-kcunk-slate text-sm mt-2">
              Silakan cek kembali nanti atau hubungi kami langsung.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-1.5 sm:gap-2 mt-10 sm:mt-14 flex-wrap px-2">
                <button
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))
                  }
                  disabled={filters.page <= 1}
                  className="w-10 h-10 rounded-sm font-bold text-sm bg-white text-kcunk-ink border border-kcunk-line hover:border-kcunk-red hover:text-kcunk-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1)
                      acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    typeof p === "string" ? (
                      <span
                        key={`dots-${i}`}
                        className="w-10 h-10 flex items-center justify-center text-kcunk-muted text-sm"
                      >
                        {p}
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() =>
                          setFilters((f) => ({ ...f, page: p as number }))
                        }
                        className={`w-10 h-10 rounded-sm font-bold text-sm transition-colors ${
                          filters.page === p
                            ? "bg-kcunk-red text-white border border-kcunk-red"
                            : "bg-white text-kcunk-ink border border-kcunk-line hover:border-kcunk-red hover:text-kcunk-red"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      page: Math.min(totalPages, f.page + 1),
                    }))
                  }
                  disabled={filters.page >= totalPages}
                  className="w-10 h-10 rounded-sm font-bold text-sm bg-white text-kcunk-ink border border-kcunk-line hover:border-kcunk-red hover:text-kcunk-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* View All CTA (homepage only) */}
            {!isFullPage && total > 6 && (
              <div className="text-center mt-10 sm:mt-14">
                <Link
                  href="/katalog"
                  className="group inline-flex items-center gap-2 px-8 py-3.5 bg-kcunk-red hover:bg-kcunk-red-dark text-white font-bold text-sm uppercase tracking-wider rounded-sm shadow-lg transition-colors"
                >
                  Lihat Semua Katalog
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
  const unoptimizedImage = shouldBypassImageOptimization(imageUrl);
  const vehicleId = listing.vehicleId || vehicle.id;
  const displayTitle = buildVehicleTitle(vehicle);
  const transmissionLabel = formatTransmissionLabel(
    vehicle.transmission || vehicle.variant?.transmissionType,
  );
  const subtitle = [
    vehicle.color?.trim(),
    transmissionLabel !== "—" ? transmissionLabel : null,
    vehicle.fuelType?.trim(),
  ]
    .filter((part): part is string => Boolean(part))
    .join(" - ");
  const price = toNumber(listing.askingPrice);
  const mileageLabel = formatMileageLabel(vehicle.mileage);

  return (
    <Link
      href={`/vehicles/${vehicleId}`}
      className="group block bg-white rounded-sm shadow-md hover:shadow-2xl border border-kcunk-line hover:border-kcunk-red/40 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image + price banner */}
      <div className="relative aspect-[4/3] overflow-hidden bg-kcunk-surface">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={displayTitle}
            fill
            unoptimized={unoptimizedImage}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Car className="w-16 h-16 text-kcunk-line" />
          </div>
        )}

        {/* Diagonal red price banner */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center">
          <div className="bg-kcunk-red text-white px-4 py-2 pr-8 relative shadow-lg">
            <span className="text-sm sm:text-base font-black tracking-tight">
              {price > 0 ? formatCurrency(price) : "Hubungi Kami"}
            </span>
            <div className="absolute top-0 right-0 h-full w-6 bg-kcunk-red transform skew-x-[-20deg] origin-top-right translate-x-2" />
          </div>
          {listing.isNegotiable && (
            <span className="ml-auto mr-4 px-2 py-1 bg-white/90 backdrop-blur text-kcunk-ink text-[10px] font-bold uppercase tracking-wider rounded-sm">
              Nego
            </span>
          )}
        </div>

        {/* Condition badge */}
        {vehicle.condition && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-kcunk-black/80 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider rounded-sm">
              {vehicle.condition}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base sm:text-lg font-black text-kcunk-ink mb-1 min-h-[2.7rem] leading-tight group-hover:text-kcunk-red transition-colors sm:min-h-[3rem]">
          {displayTitle}
        </h3>
        <p className="text-xs sm:text-sm text-kcunk-slate mb-4 min-h-[1.25rem]">
          {subtitle || "Unit siap dilihat detailnya"}
        </p>

        {/* Specs row — 3 columns */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-kcunk-line">
          <Spec
            icon={Calendar}
            label="Year"
            value={String(vehicle.year || "—")}
          />
          <Spec icon={Gauge} label="KM" value={mileageLabel} />
          <Spec icon={Car} label="Transmission" value={transmissionLabel} />
        </div>
      </div>
    </Link>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-kcunk-muted font-semibold mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <p className="text-xs sm:text-sm font-bold text-kcunk-ink truncate">
        {value}
      </p>
    </div>
  );
}
