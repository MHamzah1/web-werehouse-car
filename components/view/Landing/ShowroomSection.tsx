"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
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

const gradients = [
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-red-500",
];

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
    <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/landing/showroom-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-900/92 to-slate-950/95" />
      <div className="absolute -bottom-20 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-bold border border-emerald-500/20 mb-4 sm:mb-6">
            <Navigation className="w-4 h-4" />
            Cabang Kami
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {showrooms.length} Showroom
            </span>{" "}
            Siap Melayani
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base px-2">
            Kunjungi cabang terdekat atau hubungi via WhatsApp untuk konsultasi gratis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {showrooms.map((s, idx) => (
            <div
              key={s.id}
              className="group rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-xl"
            >
              {/* Gradient Header */}
              <div className={`bg-gradient-to-r ${gradients[idx % gradients.length]} p-5 sm:p-6 relative overflow-hidden`}>
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-lg" />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white">{s.name}</h3>
                    <span className="text-xs text-white/70 font-mono">{s.code}</span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-base sm:text-lg">
                    {idx + 1}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{s.address}</p>
                  </div>

                  {s.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-slate-400">+{s.phone}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-slate-400">Senin - Sabtu, 08:00 - 20:00</p>
                  </div>
                </div>

                {s.whatsapp && (
                  <button
                    onClick={() => openWhatsApp(s.whatsapp!, s.name)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Hubungi WhatsApp
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
