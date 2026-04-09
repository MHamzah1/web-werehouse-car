"use client";

import React from "react";
import { Phone, MapPin, Clock, Mail } from "lucide-react";

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
    <section id="kontak" className="relative py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0b0f19] to-[#020617]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium border border-orange-500/20 mb-4">
            Kontak
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Ada Pertanyaan?{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Hubungi Kami
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Tim kami siap membantu Anda menemukan mobil impian. Konsultasi gratis!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">WhatsApp</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Chat langsung dengan tim kami. Respon cepat di jam operasional.
                  </p>
                  <p className="text-orange-400 font-semibold">{WHATSAPP_DISPLAY}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Alamat Utama</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Jl. Raya Prigi, Sripit, Talunkulon, Kec. Bandung,
                    <br />
                    Kabupaten Tulungagung, Jawa Timur 66274
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Jam Operasional</h3>
                  <div className="text-gray-400 text-sm space-y-1">
                    <p>Senin - Sabtu: <span className="text-white">08:00 - 20:00 WIB</span></p>
                    <p>Minggu: <span className="text-white">09:00 - 17:00 WIB</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-orange-500/10 via-red-500/10 to-orange-500/5 border border-orange-500/20 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/20">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>

              <h3 className="text-2xl font-black text-white mb-3">
                Chat Sekarang!
              </h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Konsultasi gratis tanpa komitmen. Tanyakan soal stok, harga,
                tukar-tambah, atau apapun seputar mobil.
              </p>

              <button
                onClick={openWhatsApp}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-base hover:from-green-600 hover:to-green-700 transition-all shadow-xl shadow-green-500/25 hover:shadow-green-500/40 flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hubungi via WhatsApp
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Biasanya dibalas dalam 5-15 menit di jam operasional
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
