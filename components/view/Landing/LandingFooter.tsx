"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

const WHATSAPP_NUMBER = "6281574865632";
const WHATSAPP_DISPLAY = "+62 815-7486-5632";
const ADDRESS_LINES = [
  "Jl. Raya Prigi, Sripit, Talunkulon",
  "Kec. Bandung, Tulungagung",
  "Jawa Timur 66274",
];

const footerColumns = [
  {
    title: "Jelajahi",
    items: [
      { label: "Beranda", href: "/" },
      { label: "Katalog Mobil", href: "/katalog" },
      { label: "Tentang Kami", href: "/tentang" },
      { label: "Kontak", href: "/kontak" },
    ],
  },
  {
    title: "Layanan",
    items: [
      { label: "Jual Beli Mobil", href: "/katalog" },
      { label: "Tukar Tambah", href: "/kontak" },
      { label: "Reservasi Survey", href: "/kontak" },
      { label: "Konsultasi Gratis", href: "/kontak" },
    ],
  },
  {
    title: "Bantuan",
    items: [
      { label: "Cabang Kami", href: "/cabang" },
      { label: "Hubungi WhatsApp", href: "/kontak" },
      { label: "Jam Operasional", href: "/kontak" },
    ],
  },
  {
    title: "Perusahaan",
    items: [
      { label: "Profil K-Cunk Motor", href: "/tentang" },
      { label: "Lokasi Showroom", href: "/cabang" },
      { label: "Kontak Resmi", href: "/kontak" },
    ],
  },
];

const actionLinks = [
  {
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    label: "WhatsApp",
    icon: MessageCircle,
    newTab: true,
  },
  {
    href: `tel:${WHATSAPP_NUMBER}`,
    label: "Telepon",
    icon: Phone,
    newTab: false,
  },
  {
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      ADDRESS_LINES.join(", "),
    )}`,
    label: "Maps",
    icon: MapPin,
    newTab: true,
  },
  {
    href: "/kontak",
    label: "Kontak",
    icon: ArrowUpRight,
    internal: true,
  },
];

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#010202]">
      <div className="absolute inset-x-0 top-0 h-px bg-white/8" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_320px] xl:grid-cols-[minmax(0,1.18fr)_360px]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="kcunk-italic-logo text-2xl text-kcunk-red leading-none sm:text-3xl">
                K<span className="text-white">-Cunk</span>
              </span>
              <span className="kcunk-italic-logo text-2xl text-white leading-none tracking-tight sm:text-3xl">
                Motor
              </span>
            </Link>

            <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h3 className="text-sm font-semibold text-white">
                    {column.title}
                  </h3>
                  <div className="mt-4 space-y-2.5">
                    {column.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block text-sm leading-relaxed text-[#424952] transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:justify-self-end">
            <div className="rounded-tl-[40px] rounded-br-[40px] bg-[#303c4d] px-6 py-7 text-right shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:px-7">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {WHATSAPP_DISPLAY}
                  </p>
                  <p className="mt-1 text-sm text-[#9298a1]">
                    Chat dan reservasi via WhatsApp
                  </p>
                </div>

                <div>
                  <p className="inline-flex items-center justify-end gap-2 text-sm text-[#9298a1]">
                    <Clock3 className="h-4 w-4 text-white/70" />
                    Senin - Sabtu, 08:00 - 20:00 WIB
                  </p>
                </div>

                <div className="space-y-1 text-sm text-[#9298a1]">
                  {ADDRESS_LINES.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-5 text-white">
              {actionLinks.map((item) =>
                item.internal ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="transition-colors hover:text-kcunk-red"
                    aria-label={item.label}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.newTab ? "_blank" : undefined}
                    rel={item.newTab ? "noreferrer" : undefined}
                    className="transition-colors hover:text-kcunk-red"
                    aria-label={item.label}
                  >
                    <item.icon className="h-5 w-5" />
                  </a>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/12 pt-4 sm:mt-14 sm:pt-5">
          <div className="flex flex-col gap-3 text-xs text-[rgba(66,73,82,0.8)] sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {currentYear} K-CUNK MOTOR, All right reserved</p>

            <div className="flex items-center gap-8 sm:justify-end">
              <span>Privacy Policy</span>
              <span>Terms of Use</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
