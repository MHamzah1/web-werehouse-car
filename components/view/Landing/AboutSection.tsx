"use client";

import React from "react";
import { Shield, Search, Handshake, Award } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Inspeksi Menyeluruh",
    description:
      "Setiap kendaraan diperiksa secara detail meliputi eksterior, interior, mesin, kelistrikan, dan chassis sebelum dijual.",
  },
  {
    icon: Shield,
    title: "Dokumen Lengkap & Aman",
    description:
      "Kami memastikan BPKB, STNK, Faktur, dan kelengkapan dokumen lainnya terjamin keasliannya.",
  },
  {
    icon: Handshake,
    title: "Proses Transparan",
    description:
      "Tanpa biaya tersembunyi. Harga yang tercantum adalah harga final tanpa drama tawar-menawar yang berlebihan.",
  },
  {
    icon: Award,
    title: "Garansi Kepercayaan",
    description:
      "Berpengalaman sejak 2007 dengan ribuan pelanggan puas dari seluruh Jawa Timur dan sekitarnya.",
  },
];

export default function AboutSection() {
  return (
    <section id="tentang" className="relative py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0b0f19] to-[#020617]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium border border-orange-500/20 mb-4">
            Tentang Kami
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6">
            Kenapa Harus{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              K-CUNK MOTOR
            </span>
            ?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Didirikan oleh Suryono Hadi Pranoto sejak tahun 2007, K-CUNK MOTOR telah
            menjadi showroom mobil bekas terpercaya di Tulungagung dengan komitmen
            pada kualitas dan kejujuran.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-orange-500/30 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center mb-5 group-hover:from-orange-500/30 group-hover:to-red-600/30 transition-colors">
                <item.icon className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
