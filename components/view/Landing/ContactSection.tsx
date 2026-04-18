"use client";

import { Clock3, MapPin, MessageCircle, Phone } from "lucide-react";

const WHATSAPP_NUMBER = "6281574865632";
const WHATSAPP_DISPLAY = "+62 815-7486-5632";
const CONTACT_ADDRESS = [
  "Jl. Raya Prigi, Sripit, Talunkulon",
  "Kec. Bandung, Tulungagung",
  "Jawa Timur 66274",
];

const infoColumns = [
  {
    title: "Konsultasi",
    items: ["Pembelian unit", "Tukar tambah", "Reservasi survey"],
  },
  {
    title: "Jam Layanan",
    items: ["Senin - Sabtu", "08:00 - 20:00 WIB", "Respon cepat via WhatsApp"],
  },
  {
    title: "Kontak Cepat",
    items: [WHATSAPP_DISPLAY, "Telepon dan chat tersedia", "Datang langsung ke showroom"],
  },
  {
    title: "Area Layanan",
    items: ["Tulungagung", "Bandung", "Cabang terdekat siap melayani"],
  },
];

export default function ContactSection() {
  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Halo K-CUNK MOTOR, saya tertarik untuk konsultasi mengenai mobil. Bisa dibantu?",
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <section className="relative bg-[#010202] py-16 sm:py-[4.5rem] md:py-20">
      <div className="absolute inset-x-0 top-0 h-px bg-white/8" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_320px] lg:items-end xl:grid-cols-[minmax(0,1.18fr)_360px]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/35">
              Contact Us
            </p>
            <h2 className="kcunk-heading mt-3 text-3xl text-white sm:text-4xl md:text-5xl">
              Hubungi{" "}
              <span className="text-kcunk-red">Tim K-Cunk Motor</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
              Arah visual section ini dibuat mendekati blok footer pada Figma:
              latar hitam, informasi tersusun rapi, dan satu panel kontak utama
              yang langsung menarik perhatian.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
              {infoColumns.map((column) => (
                <div key={column.title}>
                  <h3 className="text-sm font-bold text-white">{column.title}</h3>
                  <div className="mt-4 space-y-2 text-sm text-[#424952]">
                    {column.items.map((item) => (
                      <p key={item} className="leading-relaxed">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openWhatsApp}
                className="inline-flex items-center justify-center gap-2 bg-kcunk-red px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-kcunk-red-dark"
              >
                <MessageCircle className="h-4 w-4" />
                Hubungi via WhatsApp
              </button>

              <div className="inline-flex items-center gap-2 border border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/55">
                <Clock3 className="h-4 w-4 text-kcunk-red" />
                Respon di jam operasional
              </div>
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
                    WhatsApp utama showroom
                  </p>
                </div>

                <div className="space-y-1 text-sm text-[#9298a1]">
                  {CONTACT_ADDRESS.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-5 text-white">
              <button
                type="button"
                onClick={openWhatsApp}
                className="transition-colors hover:text-kcunk-red"
                aria-label="WhatsApp utama"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <a
                href={`tel:${WHATSAPP_NUMBER}`}
                className="transition-colors hover:text-kcunk-red"
                aria-label="Telepon utama"
              >
                <Phone className="h-5 w-5" />
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_ADDRESS.join(", "))}`}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-kcunk-red"
                aria-label="Lokasi showroom"
              >
                <MapPin className="h-5 w-5" />
              </a>
              <span className="text-white/70" aria-hidden>
                <Clock3 className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
