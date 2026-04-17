"use client";

import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "6281574865632";
const WHATSAPP_DISPLAY = "+62 815-7486-5632";

export default function ContactSection() {
  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Halo K-CUNK MOTOR, saya tertarik untuk konsultasi mengenai mobil. Bisa dibantu?"
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-16"
        style={{ backgroundImage: "url('/landing/contact-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-slate-950/96" />
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-green-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-green-500/10 text-green-400 text-xs sm:text-sm font-bold border border-green-500/20 mb-4 sm:mb-6">
            <MessageCircle className="w-4 h-4" />
            Kontak
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4">
            Ada Pertanyaan?{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Hubungi Kami
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base px-2">
            Tim kami siap membantu Anda menemukan mobil impian. Konsultasi gratis!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Contact Cards */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-5">
            {[
              {
                icon: Phone,
                title: "WhatsApp",
                desc: "Chat langsung dengan tim kami. Respon cepat di jam operasional.",
                detail: WHATSAPP_DISPLAY,
                color: "from-green-500 to-emerald-600",
                bg: "bg-green-500/10",
              },
              {
                icon: MapPin,
                title: "Alamat Utama",
                desc: "Jl. Raya Prigi, Sripit, Talunkulon, Kec. Bandung, Kabupaten Tulungagung, Jawa Timur 66274",
                detail: null,
                color: "from-cyan-500 to-blue-600",
                bg: "bg-cyan-500/10",
              },
              {
                icon: Clock,
                title: "Jam Operasional",
                desc: null,
                detail: null,
                color: "from-violet-500 to-purple-600",
                bg: "bg-violet-500/10",
                schedule: [
                  { day: "Senin - Sabtu", time: "08:00 - 20:00 WIB" },
                  { day: "Minggu", time: "09:00 - 17:00 WIB" },
                ],
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                >
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white mb-1">{item.title}</h3>
                  {item.desc && (
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  )}
                  {item.detail && (
                    <p className="text-cyan-400 font-semibold text-sm sm:text-base mt-1">{item.detail}</p>
                  )}
                  {item.schedule && (
                    <div className="space-y-1 mt-1">
                      {item.schedule.map((s, j) => (
                        <p key={j} className="text-xs sm:text-sm text-slate-400">
                          {s.day}: <span className="text-white font-medium">{s.time}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp CTA Card */}
          <div className="lg:col-span-2 flex items-center">
            <div className="w-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-green-500/20 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
                <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3">
                Chat Sekarang!
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">
                Konsultasi gratis tanpa komitmen. Tanyakan soal stok, harga, tukar-tambah, atau apapun seputar mobil.
              </p>

              <button
                onClick={openWhatsApp}
                className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm sm:text-base hover:brightness-110 transition-all shadow-xl shadow-green-500/25 flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hubungi via WhatsApp
              </button>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-3 sm:mt-4">
                Biasanya dibalas dalam 5-15 menit di jam operasional
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
