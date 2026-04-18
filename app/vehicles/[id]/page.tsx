"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LandingFooter from "@/components/view/Landing/LandingFooter";
import { instanceAxios } from "@/lib/axiosInstance/instanceAxios";
import {
  resolveMediaUrl,
  shouldBypassImageOptimization,
} from "@/lib/media-url";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  Fuel,
  Gauge,
  MapPin,
  MessageCircle,
  Palette,
  Phone,
  Shield,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface VehicleShowroom {
  id: string;
  name: string;
  city: string;
  province: string;
  phone: string | null;
  whatsapp: string | null;
  address: string;
}

interface ListingVehicleDetail {
  id: string;
  brandName: string;
  modelName: string;
  year: number;
  color: string | null;
  transmission: string | null;
  fuelType: string | null;
  mileage: number;
  askingPrice: number | string;
  images: string[];
  description: string | null;
  condition: string | null;
  showroom: VehicleShowroom | null;
}

interface PublicListingDetail {
  id: string;
  vehicleId: string;
  listingId: string;
  listingTitle: string;
  askingPrice: number | string;
  description: string | null;
  isNegotiable: boolean;
  highlights?: string[];
  videoUrl?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
  viewCount?: number;
  publishedAt?: string | null;
  vehicle: ListingVehicleDetail;
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

const formatMileage = (value: number) =>
  value > 0 ? `${value.toLocaleString("id-ID")} km` : "-";

const sanitizePhoneNumber = (value: string | null | undefined) =>
  value ? value.replace(/[^\d]/g, "") : "";

const formatPhoneDisplay = (value: string | null | undefined) => {
  if (!value) return "-";
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("62")) return `+${trimmed}`;
  return trimmed;
};

const buildWhatsAppUrl = (
  phone: string,
  contactName: string,
  vehicle: ListingVehicleDetail,
) => {
  const message = encodeURIComponent(
    `Halo ${contactName}, saya tertarik dengan mobil ${vehicle.brandName} ${vehicle.modelName} ${vehicle.year}${vehicle.color ? ` warna ${vehicle.color}` : ""}. Apakah unit ini masih tersedia?`,
  );
  return `https://wa.me/${phone}?text=${message}`;
};

const formatPublishedDate = (value: string | null | undefined) => {
  if (!value) return "Listing aktif";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Listing aktif";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

export default function VehicleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [listing, setListing] = useState<PublicListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const { data } = await instanceAxios.get(`/public/listings/vehicle/${id}`);
        setListing(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-kcunk-surface flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-kcunk-red border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !listing?.vehicle) {
    return (
      <div className="min-h-screen bg-kcunk-surface px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-xl items-center justify-center min-h-[70vh]">
          <div className="w-full overflow-hidden rounded-sm border border-kcunk-line bg-white shadow-[0_24px_70px_rgba(11,11,13,0.08)]">
            <div className="h-1.5 bg-kcunk-red" />
            <div className="p-8 text-center sm:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-sm bg-kcunk-black text-white">
                <Car className="w-8 h-8" />
              </div>
              <h1 className="mt-6 text-2xl font-black text-kcunk-ink sm:text-3xl">
                Kendaraan Tidak Ditemukan
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-kcunk-slate sm:text-base">
                Unit ini mungkin sudah terjual atau belum tersedia untuk publik.
              </p>
              <Link
                href="/katalog"
                className="mt-7 inline-flex items-center gap-2 rounded-sm bg-kcunk-red px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-kcunk-red-dark"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Katalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vehicle = listing.vehicle;
  const title =
    listing.listingTitle?.trim() ||
    `${vehicle.brandName} ${vehicle.modelName}`.trim();
  const heroSubtitle = [
    String(vehicle.year),
    vehicle.transmission || "Transmisi belum dicantumkan",
    vehicle.fuelType || "Bahan bakar belum dicantumkan",
    vehicle.color || "Warna belum dicantumkan",
  ].join(" - ");
  const images =
    vehicle.images?.length > 0
      ? vehicle.images.map((image) => resolveMediaUrl(image))
      : [];
  const description = listing.description || vehicle.description;
  const priceLabel =
    toNumber(listing.askingPrice) > 0
      ? formatCurrency(listing.askingPrice)
      : "Hubungi Kami";
  const rawPhone = listing.contactPhone || vehicle.showroom?.phone || null;
  const rawWhatsapp =
    listing.contactWhatsapp || vehicle.showroom?.whatsapp || null;
  const phoneNumber = sanitizePhoneNumber(rawPhone);
  const whatsappNumber = sanitizePhoneNumber(rawWhatsapp);
  const contactName =
    listing.contactName || vehicle.showroom?.name || "tim showroom";
  const whatsappUrl = whatsappNumber
    ? buildWhatsAppUrl(whatsappNumber, contactName, vehicle)
    : null;
  const primaryContactHref = whatsappUrl || (phoneNumber ? `tel:${phoneNumber}` : null);
  const primaryContactLabel = whatsappUrl
    ? "Hubungi via WhatsApp"
    : phoneNumber
      ? "Telepon Showroom"
      : "Kontak Belum Tersedia";
  const summaryFacts = [
    { label: "Kilometer", value: formatMileage(vehicle.mileage) },
    { label: "Bahan Bakar", value: vehicle.fuelType || "-" },
    { label: "Kondisi", value: vehicle.condition || "Baik" },
    {
      label: "Dilihat",
      value: listing.viewCount ? `${listing.viewCount} kali` : "Listing aktif",
    },
  ];
  const stripStats = [
    { label: "Tahun", value: String(vehicle.year) },
    { label: "Transmisi", value: vehicle.transmission || "-" },
    { label: "Warna", value: vehicle.color || "-" },
    {
      label: "Showroom",
      value: vehicle.showroom?.city || "Hubungi kami",
    },
  ];
  const specCards = [
    { label: "Tahun", value: String(vehicle.year), icon: Calendar },
    { label: "Transmisi", value: vehicle.transmission || "-", icon: Gauge },
    { label: "Bahan Bakar", value: vehicle.fuelType || "-", icon: Fuel },
    { label: "Kilometer", value: formatMileage(vehicle.mileage), icon: Gauge },
    { label: "Warna", value: vehicle.color || "-", icon: Palette },
    { label: "Kondisi", value: vehicle.condition || "Baik", icon: Shield },
  ];
  const publishedLabel = formatPublishedDate(listing.publishedAt);
  const highlightItems = Array.from(
    new Set(
      [
        ...(listing.highlights || []),
        listing.isNegotiable ? "Harga bisa nego" : null,
        vehicle.showroom?.city ? `Tersedia di ${vehicle.showroom.city}` : null,
        vehicle.condition ? `Kondisi ${vehicle.condition}` : null,
      ].filter((item): item is string => Boolean(item?.trim())),
    ),
  ).slice(0, 4);
  const heroBadges = [
    publishedLabel,
    vehicle.showroom?.city ? `Showroom ${vehicle.showroom.city}` : null,
    vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : null,
    listing.isNegotiable ? "Harga bisa nego" : "Harga tetap",
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="min-h-screen bg-kcunk-surface text-kcunk-ink">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-kcunk-black/95 backdrop-blur-md">
        <div className="h-1 bg-kcunk-red" />
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-kcunk-red"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke katalog</span>
            <span className="sm:hidden">Kembali</span>
          </Link>

          <Link href="/" className="flex items-center gap-2 text-right sm:text-left">
            <span className="kcunk-italic-logo text-2xl text-kcunk-red leading-none sm:text-3xl">
              K<span className="text-white">-Cunk</span>
            </span>
            <span className="kcunk-italic-logo text-2xl text-white leading-none tracking-tight sm:text-3xl">
              Motor
            </span>
          </Link>
        </div>
      </header>

      <main className="pb-20 lg:pb-0">
        <section className="relative overflow-hidden bg-kcunk-black pb-12 sm:pb-16">
          <div className="absolute inset-y-0 left-0 w-full bg-kcunk-red lg:w-[38%]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_34%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.34))]" />

          <div className="relative max-w-7xl mx-auto px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="relative overflow-hidden pt-6 sm:pt-8">
                  <span
                    className="pointer-events-none absolute left-0 top-0 text-[40px] font-black uppercase leading-none tracking-[0.18em] text-transparent opacity-35 sm:text-[60px]"
                    style={{ WebkitTextStroke: "1px rgba(255,255,255,0.28)" }}
                  >
                    Detail
                  </span>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-white/70 sm:text-sm">
                    Koleksi Pilihan K-Cunk Motor
                  </p>
                  <h1 className="kcunk-heading mt-2 text-3xl text-white sm:text-4xl lg:text-5xl">
                    {title}
                  </h1>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {heroBadges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-sm border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="self-start border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm sm:px-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                  Harga Penawaran
                </p>
                <p className="mt-1.5 text-xl font-black text-white sm:text-2xl">
                  {priceLabel}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.78fr)] xl:gap-5">
              <div className="overflow-hidden rounded-sm border border-white/70 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
                <div className="relative aspect-[16/10] bg-kcunk-surface">
                  {images.length > 0 ? (
                    <>
                      <Image
                        src={images[activeImage]}
                        alt={title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        unoptimized={shouldBypassImageOptimization(images[activeImage])}
                        className="object-cover cursor-pointer"
                        onClick={() => setLightboxOpen(true)}
                      />

                      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end gap-2 p-3 sm:p-4">
                        <div className="relative bg-kcunk-red px-4 py-2.5 pr-10 text-white shadow-lg sm:px-5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                            Harga
                          </p>
                          <p className="mt-1 text-base font-black sm:text-lg">
                            {priceLabel}
                          </p>
                          <div className="absolute right-0 top-0 h-full w-6 translate-x-2 skew-x-[-18deg] bg-kcunk-red" />
                        </div>

                        {listing.isNegotiable && (
                          <span className="rounded-sm bg-kcunk-black px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-md">
                            Bisa Nego
                          </span>
                        )}
                      </div>

                      <div className="absolute right-3 top-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setLightboxOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-sm bg-white/90 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-kcunk-ink shadow-md transition-colors hover:bg-white"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {activeImage + 1}/{images.length}
                        </button>
                      </div>

                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveImage((prev) =>
                                prev === 0 ? images.length - 1 : prev - 1,
                              )
                            }
                            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-kcunk-ink shadow-lg transition-colors hover:bg-white"
                            aria-label="Foto sebelumnya"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveImage((prev) =>
                                prev === images.length - 1 ? 0 : prev + 1,
                              )
                            }
                            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-kcunk-ink shadow-lg transition-colors hover:bg-white"
                            aria-label="Foto berikutnya"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(135deg,#f7f8fa_0%,#ebeef3_100%)] text-center">
                      <Car className="w-20 h-20 text-kcunk-muted" />
                      <p className="mt-4 text-sm font-semibold text-kcunk-slate">
                        Foto unit belum tersedia
                      </p>
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="border-t border-kcunk-line bg-white px-4 py-4 sm:px-5 sm:py-5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-kcunk-muted">
                        Galeri Unit
                      </p>
                      <p className="text-xs text-kcunk-slate">
                        {images.length} foto tersedia
                      </p>
                    </div>

                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                      {images.map((img, index) => (
                        <button
                          type="button"
                          key={`${img}-${index}`}
                          onClick={() => setActiveImage(index)}
                          className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm border transition-all sm:h-24 sm:w-24 ${
                            index === activeImage
                              ? "border-kcunk-red shadow-[0_12px_35px_rgba(230,57,70,0.18)]"
                              : "border-kcunk-line opacity-70 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`Foto kendaraan ${index + 1}`}
                            fill
                            sizes="96px"
                            unoptimized={shouldBypassImageOptimization(img)}
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 self-start lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-sm border border-kcunk-line bg-white shadow-[0_22px_60px_rgba(11,11,13,0.08)]">
                  <div className="h-1.5 bg-kcunk-red" />
                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-kcunk-red">
                      Ringkasan Unit
                    </p>
                    <h2 className="mt-2 text-xl font-black text-kcunk-ink sm:text-2xl">
                      {title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-kcunk-slate">
                      {heroSubtitle}
                    </p>

                    {highlightItems.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {highlightItems.map((item) => (
                          <span
                            key={item}
                            className="rounded-sm border border-kcunk-red/20 bg-kcunk-red/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-kcunk-red"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      {summaryFacts.map((fact) => (
                        <div
                          key={fact.label}
                          className="rounded-sm border border-kcunk-line bg-kcunk-surface px-3 py-3"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-kcunk-muted">
                            {fact.label}
                          </p>
                          <p className="mt-2 text-sm font-black text-kcunk-ink">
                            {fact.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-sm bg-kcunk-black px-4 py-4 text-white">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                        Status Listing
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-lg font-black text-white">
                            {publishedLabel}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/55">
                            Tanggal tayang
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-white">
                            {listing.viewCount ? `${listing.viewCount}` : "Aktif"}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/55">
                            {listing.viewCount ? "Total view" : "Status unit"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {primaryContactHref ? (
                        <a
                          href={primaryContactHref}
                          target={whatsappUrl ? "_blank" : undefined}
                          rel={whatsappUrl ? "noreferrer" : undefined}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-kcunk-red px-5 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-kcunk-red-dark"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {primaryContactLabel}
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-sm bg-kcunk-line px-5 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-kcunk-muted"
                        >
                          <Phone className="w-4 h-4" />
                          Kontak Belum Tersedia
                        </button>
                      )}

                      {phoneNumber && whatsappUrl && (
                        <a
                          href={`tel:${phoneNumber}`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-kcunk-ink px-5 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-kcunk-ink transition-colors hover:bg-kcunk-ink hover:text-white"
                        >
                          <Phone className="w-4 h-4" />
                          Telepon Showroom
                        </a>
                      )}
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-kcunk-muted">
                      Respon biasanya lebih cepat untuk pertanyaan stok,
                      negosiasi, dan permintaan kirim detail foto tambahan.
                    </p>
                  </div>
                </div>

                {vehicle.showroom && (
                  <div className="overflow-hidden rounded-sm border border-kcunk-line bg-white shadow-[0_18px_50px_rgba(11,11,13,0.08)]">
                    <div className="flex items-start gap-3 border-b border-kcunk-line p-4 sm:p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-kcunk-red text-white">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-kcunk-red">
                          Lokasi Showroom
                        </p>
                        <h3 className="mt-1 text-base font-black text-kcunk-ink sm:text-lg">
                          {vehicle.showroom.name}
                        </h3>
                        <p className="text-sm text-kcunk-slate">
                          {vehicle.showroom.city}, {vehicle.showroom.province}
                        </p>
                      </div>
                    </div>

                    <div className="bg-kcunk-black p-4 text-white sm:p-5">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 w-4 h-4 flex-shrink-0 text-kcunk-red-light" />
                          <p className="text-sm leading-relaxed text-white/80">
                            {vehicle.showroom.address}
                          </p>
                        </div>

                        {rawPhone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 flex-shrink-0 text-kcunk-red-light" />
                            <p className="text-sm text-white/80">
                              {formatPhoneDisplay(rawPhone)}
                            </p>
                          </div>
                        )}

                        {rawWhatsapp && rawWhatsapp !== rawPhone && (
                          <div className="flex items-center gap-3">
                            <MessageCircle className="w-4 h-4 flex-shrink-0 text-kcunk-red-light" />
                            <p className="text-sm text-white/80">
                              {formatPhoneDisplay(rawWhatsapp)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-6 sm:-mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-kcunk-line bg-kcunk-line shadow-[0_24px_80px_rgba(11,11,13,0.08)] lg:grid-cols-4">
              {stripStats.map((item) => (
                <div key={item.label} className="bg-white px-4 py-4 sm:px-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kcunk-muted">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-black text-kcunk-ink sm:text-base">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-sm border border-kcunk-line bg-white shadow-[0_18px_50px_rgba(11,11,13,0.06)]">
                <div className="border-b border-kcunk-line px-4 py-3.5 sm:px-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-kcunk-red">
                    Tentang Mobil
                  </p>
                  <h3 className="mt-1.5 text-xl font-black text-kcunk-ink sm:text-2xl">
                    Detail yang Perlu Anda Tahu
                  </h3>
                </div>

                <div className="p-4 sm:p-5">
                  <p className="text-sm leading-relaxed text-kcunk-slate whitespace-pre-line sm:text-base">
                    {description ||
                      "Deskripsi detail unit belum dicantumkan. Untuk mengetahui kondisi eksterior, interior, hasil inspeksi, atau riwayat pemakaian, silakan hubungi showroom melalui tombol kontak yang tersedia."}
                  </p>

                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    <div className="rounded-sm border border-kcunk-line bg-kcunk-surface px-4 py-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-kcunk-muted">
                        Foto Tersedia
                      </p>
                      <p className="mt-2 text-lg font-black text-kcunk-ink">
                        {images.length > 0 ? `${images.length} Sudut Foto` : "Belum Ada Foto"}
                      </p>
                    </div>

                    <div className="rounded-sm border border-kcunk-line bg-kcunk-surface px-4 py-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-kcunk-muted">
                        Status Harga
                      </p>
                      <p className="mt-2 text-lg font-black text-kcunk-ink">
                        {listing.isNegotiable ? "Masih Bisa Nego" : "Harga Tetap"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-sm border border-kcunk-line bg-white shadow-[0_18px_50px_rgba(11,11,13,0.06)]">
                <div className="border-b border-kcunk-line px-4 py-3.5 sm:px-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-kcunk-red">
                    Spesifikasi Lengkap
                  </p>
                  <h3 className="mt-1.5 text-xl font-black text-kcunk-ink sm:text-2xl">
                    Ringkas, Jelas, dan Mudah Dibandingkan
                  </h3>
                </div>

                <div className="grid gap-px bg-kcunk-line sm:grid-cols-2 xl:grid-cols-3">
                  {specCards.map((item) => (
                    <SpecCard
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="h-full">
              <div className="flex h-full flex-col overflow-hidden rounded-sm border border-kcunk-line bg-white shadow-[0_18px_50px_rgba(11,11,13,0.06)]">
                <div className="flex-1 bg-kcunk-black px-4 py-4 text-white sm:px-5 sm:py-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-kcunk-red-light">
                    Bantuan Cepat
                  </p>
                  <h3 className="mt-1.5 text-xl font-black sm:text-2xl">
                    Butuh Unit Lain untuk Dibandingkan?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    Buka katalog untuk melihat unit lain dengan visual yang sama
                    rapi, lalu bandingkan harga, tahun, dan detail showroom.
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-sm border border-white/10 bg-white/5 px-3 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                        Fokus Cek
                      </p>
                      <p className="mt-1.5 text-sm font-black text-white">
                        Harga, tahun, km
                      </p>
                    </div>
                    <div className="rounded-sm border border-white/10 bg-white/5 px-3 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                        Survey Cepat
                      </p>
                      <p className="mt-1.5 text-sm font-black text-white">
                        Hubungi showroom
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/katalog"
                    className="mt-4 inline-flex items-center gap-2 rounded-sm bg-kcunk-red px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-kcunk-red-dark"
                  >
                    Lihat Katalog
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid gap-px bg-kcunk-line sm:grid-cols-3">
                  <MiniInfoCard
                    label="Kontak"
                    value={primaryContactHref ? "Siap Dihubungi" : "Belum Tersedia"}
                  />
                  <MiniInfoCard
                    label="Listing"
                    value={listing.viewCount ? `${listing.viewCount} View` : "Aktif"}
                  />
                  <MiniInfoCard
                    label="Harga"
                    value={listing.isNegotiable ? "Nego" : "Tetap"}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingFooter />
      </main>

      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Tutup galeri"
          >
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveImage((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1,
                  )
                }
                className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveImage((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1,
                  )
                }
                className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Foto berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="flex h-full items-center justify-center px-4 py-16">
            <div className="relative w-full max-w-6xl aspect-[16/10] overflow-hidden rounded-sm">
              <Image
                src={images[activeImage]}
                alt={`Foto kendaraan ${activeImage + 1}`}
                fill
                sizes="100vw"
                unoptimized={shouldBypassImageOptimization(images[activeImage])}
                className="object-contain"
              />
            </div>
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-sm bg-kcunk-red px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
            {activeImage + 1} / {images.length}
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-kcunk-black/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
              Harga
            </p>
            <p className="truncate text-sm font-black text-white">{priceLabel}</p>
          </div>

          {primaryContactHref ? (
            <a
              href={primaryContactHref}
              target={whatsappUrl ? "_blank" : undefined}
              rel={whatsappUrl ? "noreferrer" : undefined}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-kcunk-red px-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-kcunk-red-dark"
            >
              <MessageCircle className="w-4 h-4" />
              {whatsappUrl ? "Chat" : "Telepon"}
            </a>
          ) : (
            <span className="inline-flex min-h-11 items-center justify-center rounded-sm bg-white/10 px-4 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
              Kontak N/A
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SpecCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white px-5 py-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-kcunk-red/10 text-kcunk-red">
        <Icon className="w-5 h-5" />
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-kcunk-muted">
        {label}
      </p>
      <p className="mt-2 text-base font-black text-kcunk-ink">{value}</p>
    </div>
  );
}

function MiniInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-kcunk-muted">
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-kcunk-ink">{value}</p>
    </div>
  );
}
