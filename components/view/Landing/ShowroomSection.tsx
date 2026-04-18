"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { instanceAxios } from "@/lib/axiosInstance/instanceAxios";

interface Showroom {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  province: string;
  phone: string | null;
  whatsapp: string | null;
  logo: string | null;
}

const sanitizePhoneNumber = (value: string | null | undefined) =>
  value ? value.replace(/[^\d]/g, "") : "";

const formatPhoneDisplay = (value: string | null | undefined) => {
  if (!value) return "-";
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("62")) return `+${trimmed}`;
  return trimmed;
};

const buildMapsUrl = (showroom: Showroom) => {
  const query = encodeURIComponent(
    `${showroom.name}, ${showroom.address}, ${showroom.city}, ${showroom.province}`,
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

export default function ShowroomSection() {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await instanceAxios.get("/public/showrooms");
        setShowrooms(data);
      } catch {
        // silent
      }
    })();
  }, []);

  const openWhatsApp = (whatsapp: string, name: string) => {
    const phone = sanitizePhoneNumber(whatsapp);
    if (!phone) return;

    const message = encodeURIComponent(
      `Halo ${name}, saya tertarik dengan unit mobil yang tersedia di showroom Anda. Bisa dibantu informasinya?`,
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  if (showrooms.length === 0) return null;

  const locationChips = Array.from(
    new Set(
      showrooms.map((showroom) => `${showroom.city}, ${showroom.province}`),
    ),
  ).slice(0, 8);

  return (
    <section className="relative bg-white py-16 sm:py-20 md:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-kcunk-line" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.26em] text-kcunk-muted mb-3">
            Our Showrooms
          </p>
          <h2 className="kcunk-heading text-3xl sm:text-4xl md:text-5xl text-kcunk-ink mb-4">
            Kunjungi{" "}
            <span className="text-kcunk-red">{showrooms.length} Cabang</span>{" "}
            K-Cunk Motor
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-kcunk-slate leading-relaxed">
            Mengikuti arah visual landing page Figma, section ini dibuat lebih
            bersih dan rapi agar informasi cabang mudah dipindai tanpa terasa
            berat.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {showrooms.map((showroom, index) => {
            const phoneDisplay = formatPhoneDisplay(showroom.phone);
            const hasWhatsApp = Boolean(sanitizePhoneNumber(showroom.whatsapp));

            return (
              <article
                key={showroom.id}
                className="group relative overflow-hidden border border-kcunk-line bg-white shadow-[0_16px_45px_rgba(11,11,13,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(11,11,13,0.12)]"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-kcunk-red" />

                <div className="px-5 pb-5 pt-6 sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-kcunk-red">
                        {showroom.code || `Cabang ${index + 1}`}
                      </p>
                      <h3 className="mt-2 text-xl font-black text-kcunk-ink">
                        {showroom.name}
                      </h3>
                      <p className="mt-1 text-sm text-kcunk-slate">
                        {showroom.city}, {showroom.province}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-kcunk-line text-sm font-black text-kcunk-red">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-kcunk-line pt-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-kcunk-red" />
                      <p className="text-sm leading-relaxed text-kcunk-slate">
                        {showroom.address}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 flex-shrink-0 text-kcunk-red" />
                      <p className="text-sm text-kcunk-slate">{phoneDisplay}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock3 className="h-4 w-4 flex-shrink-0 text-kcunk-red" />
                      <p className="text-sm text-kcunk-slate">
                        Senin - Sabtu, 08:00 - 20:00 WIB
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2.5">
                    <a
                      href={buildMapsUrl(showroom)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 border border-kcunk-ink px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-kcunk-ink transition-colors hover:bg-kcunk-ink hover:text-white"
                    >
                      Maps
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>

                    {hasWhatsApp ? (
                      <button
                        type="button"
                        onClick={() =>
                          openWhatsApp(showroom.whatsapp!, showroom.name)
                        }
                        className="inline-flex items-center justify-center gap-2 bg-kcunk-red px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-kcunk-red-dark"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </button>
                    ) : (
                      <span className="inline-flex items-center justify-center border border-kcunk-line bg-kcunk-surface px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-kcunk-muted">
                        Kontak N/A
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 border-t border-kcunk-line pt-6">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.24em] text-kcunk-muted">
            Jaringan Cabang K-Cunk Motor
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {locationChips.map((location) => (
              <span
                key={location}
                className="inline-flex min-w-[130px] items-center justify-center rounded-full border border-kcunk-line bg-kcunk-surface px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-kcunk-slate"
              >
                {location}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
