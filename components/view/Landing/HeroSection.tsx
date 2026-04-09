"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  const scrollToCatalog = () => {
    const el = document.querySelector("#katalog");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    const el = document.querySelector("#kontak");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="beranda"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-600/8 via-transparent to-transparent" />

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Sejak 2007 &mdash; Dipercaya Ribuan Pelanggan
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
          <span className="text-white">Mobil Bekas</span>
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Berkualitas
          </span>
          <span className="text-white">, Harga</span>
          <br />
          <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Realistis
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Temukan mobil impian Anda di K-CUNK MOTOR. Setiap kendaraan telah melalui{" "}
          <span className="text-orange-400 font-medium">inspeksi menyeluruh</span>{" "}
          dengan proses transparan dan tanpa drama.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={scrollToCatalog}
            className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
          >
            Lihat Katalog Mobil
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </button>
          <button
            onClick={scrollToContact}
            className="px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 hover:border-white/30 transition-all backdrop-blur-sm"
          >
            Hubungi Kami
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-orange-400">17+</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">Tahun Pengalaman</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-orange-400">3</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">Cabang Showroom</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-orange-400">1000+</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">Pelanggan Puas</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToCatalog}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 hover:text-orange-400 transition-colors animate-bounce"
      >
        <ChevronDown size={28} />
      </button>
    </section>
  );
}
