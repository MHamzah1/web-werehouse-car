"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Star, Users, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    badge: "Showroom Terpercaya Sejak 2007",
    title: "Mobil Bekas",
    highlight: "Berkualitas",
    subtitle: "Harga Realistis",
    description:
      "Temukan mobil impian Anda dari koleksi kendaraan yang telah melewati inspeksi ketat 50+ titik pengecekan.",
    accent: "from-cyan-500 to-blue-600",
  },
  {
    badge: "3 Cabang Showroom di Tulungagung",
    title: "Proses",
    highlight: "Transparan",
    subtitle: "Tanpa Drama",
    description:
      "Setiap kendaraan dilengkapi dokumen resmi. Tanpa biaya tersembunyi, tanpa manipulasi odometer.",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    badge: "Inspeksi Profesional",
    title: "Kualitas",
    highlight: "Terjamin",
    subtitle: "100% Terverifikasi",
    description:
      "Tim inspektur berpengalaman memeriksa eksterior, interior, mesin, kelistrikan, dan chassis setiap unit.",
    accent: "from-orange-500 to-red-500",
  },
];

const stats = [
  { icon: Star, value: "17+", label: "Tahun Pengalaman" },
  { icon: Users, value: "1000+", label: "Pelanggan Puas" },
  { icon: Shield, value: "50+", label: "Titik Inspeksi" },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  const goTo = (dir: number) => {
    setCurrent((prev) => (prev + dir + slides.length) % slides.length);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Animated orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-slate-800/30 blur-3xl" />

      {/* Slide overlay accent */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-[0.04] transition-all duration-1000`}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-28 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left - Text */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div
              key={`badge-${current}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold backdrop-blur-md bg-white/10 text-cyan-400 border border-cyan-500/30 mb-6 animate-[fadeInUp_0.5s_ease-out]"
            >
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              {slide.badge}
            </div>

            {/* Title */}
            <h1
              key={`title-${current}`}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black leading-[1.1] mb-6 animate-[fadeInUp_0.5s_ease-out_0.1s_both]"
            >
              <span className="text-white">{slide.title}</span>
              <br />
              <span
                className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}
              >
                {slide.highlight}
              </span>
              <br />
              <span className="text-white">{slide.subtitle}</span>
            </h1>

            {/* Description */}
            <p
              key={`desc-${current}`}
              className="text-sm sm:text-base lg:text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed animate-[fadeInUp_0.5s_ease-out_0.2s_both]"
            >
              {slide.description}
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-[fadeInUp_0.5s_ease-out_0.3s_both]">
              <Link
                href="/katalog"
                className={`group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r ${slide.accent} text-white font-bold text-sm sm:text-base shadow-2xl hover:brightness-110 hover:scale-[1.02] transition-all`}
              >
                Lihat Katalog
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/kontak"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-white/20 text-white font-semibold text-sm sm:text-base hover:bg-white/5 hover:border-white/30 backdrop-blur-sm transition-all"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>

          {/* Right - Stats & Visual */}
          <div className="flex flex-col items-center lg:items-end gap-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-md">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="backdrop-blur-md bg-white/[0.06] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10 text-center hover:bg-white/10 transition-colors"
                >
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                    {stat.value}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Decorative card */}
            <div className="relative w-full max-w-md">
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${slide.accent} flex items-center justify-center shadow-lg`}
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">
                      Garansi Kualitas
                    </p>
                    <p className="text-slate-500 text-xs">
                      Setiap unit terinspeksi
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    "Mesin & Transmisi Terverifikasi",
                    "Dokumen BPKB/STNK Asli",
                    "Bebas Banjir & Tabrakan",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs sm:text-sm text-slate-300"
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-gradient-to-r ${slide.accent} flex items-center justify-center flex-shrink-0`}
                      >
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        <button
          onClick={() => goTo(-1)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === current
                  ? "w-8 bg-gradient-to-r from-cyan-400 to-blue-500"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => goTo(1)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
