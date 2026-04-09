"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
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
    const phone = whatsapp.startsWith("62") ? whatsapp : `62${whatsapp.replace(/^0/, "")}`;
    const message = encodeURIComponent(
      `Halo ${name}, saya tertarik dengan mobil di showroom Anda. Bisa info lebih lanjut?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  if (showrooms.length === 0) return null;

  return (
    <section id="cabang" className="relative py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#070c18] to-[#020617]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium border border-orange-500/20 mb-4">
            Cabang Kami
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              {showrooms.length} Showroom
            </span>{" "}
            Siap Melayani
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Kunjungi cabang terdekat kami atau hubungi via WhatsApp untuk konsultasi gratis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {showrooms.map((s, idx) => (
            <div
              key={s.id}
              className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-orange-500/30 transition-all duration-300"
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-white">{s.name}</h3>
                  <span className="text-xs text-gray-500 font-mono">{s.code}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                  {idx + 1}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-400 leading-relaxed">{s.address}</p>
              </div>

              {/* Phone */}
              {s.phone && (
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <p className="text-sm text-gray-400">
                    +{s.phone}
                  </p>
                </div>
              )}

              {/* Hours */}
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <p className="text-sm text-gray-400">Senin - Sabtu, 08:00 - 20:00</p>
              </div>

              {/* CTA */}
              {s.whatsapp && (
                <button
                  onClick={() => openWhatsApp(s.whatsapp!, s.name)}
                  className="w-full py-3 rounded-xl bg-green-600/20 border border-green-500/30 text-green-400 font-semibold text-sm hover:bg-green-600/30 hover:border-green-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Hubungi via WhatsApp
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
