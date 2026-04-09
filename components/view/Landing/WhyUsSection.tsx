"use client";

import React from "react";
import { ClipboardCheck, Wrench, ShieldCheck, BadgeCheck, Truck, HeartHandshake } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Inspeksi Ketat",
    description: "Kendaraan diperiksa 50+ titik pengecekan oleh tim inspektur profesional.",
  },
  {
    icon: Wrench,
    step: "02",
    title: "Perbaikan Berkualitas",
    description: "Kendaraan yang perlu perbaikan ditangani oleh mekanik berpengalaman.",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Verifikasi Dokumen",
    description: "Kelengkapan dan keabsahan BPKB, STNK, dan dokumen lain diverifikasi.",
  },
  {
    icon: BadgeCheck,
    step: "04",
    title: "Siap Jual",
    description: "Hanya kendaraan yang lolos semua tahap yang masuk katalog penjualan.",
  },
  {
    icon: HeartHandshake,
    step: "05",
    title: "Proses Mudah",
    description: "Konsultasi gratis via WhatsApp, negosiasi transparan, dan proses cepat.",
  },
  {
    icon: Truck,
    step: "06",
    title: "Pengiriman Aman",
    description: "Kendaraan disiapkan dan diserahkan dalam kondisi terbaik kepada Anda.",
  },
];

export default function WhyUsSection() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0b0f19] to-[#020617]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium border border-orange-500/20 mb-4">
            Proses Kami
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Dari Inspeksi Hingga{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Tangan Anda
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Setiap kendaraan melewati proses ketat sebelum sampai ke katalog kami.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-orange-500/20 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center group-hover:from-orange-500/30 group-hover:to-red-600/30 transition-colors">
                  <item.icon className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <span className="text-xs text-orange-500/60 font-mono font-bold">
                    STEP {item.step}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
