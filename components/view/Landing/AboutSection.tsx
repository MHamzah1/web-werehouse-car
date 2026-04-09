"use client";

import { Shield, Search, Handshake, Award, CheckCircle, Sparkles } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Inspeksi 50+ Titik",
    description: "Eksterior, interior, mesin, kelistrikan, dan chassis diperiksa secara menyeluruh oleh tim inspektur profesional.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Shield,
    title: "Dokumen Terjamin",
    description: "BPKB, STNK, Faktur, dan kelengkapan dokumen lainnya diverifikasi keasliannya sebelum kendaraan ditawarkan.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Handshake,
    title: "Proses Transparan",
    description: "Tanpa biaya tersembunyi dan tanpa drama. Harga yang ditampilkan adalah harga final yang bisa dinegosiasikan.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Award,
    title: "Terpercaya Sejak 2007",
    description: "Lebih dari 17 tahun pengalaman melayani ribuan pelanggan dari Tulungagung dan seluruh Jawa Timur.",
    gradient: "from-orange-500 to-red-500",
  },
];

const benefits = [
  "Bebas banjir & tabrakan",
  "Mesin & transmisi terverifikasi",
  "Garansi dokumen asli",
  "Tidak ada manipulasi odometer",
  "Konsultasi gratis via WhatsApp",
  "3 cabang showroom",
];

export default function AboutSection() {
  return (
    <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-900" />
      <div className="absolute -top-40 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-xs sm:text-sm font-bold border border-cyan-500/20 mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4" />
            Tentang Kami
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6">
            Kenapa Memilih{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              K-CUNK MOTOR
            </span>
            ?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed px-2">
            Didirikan oleh Suryono Hadi Pranoto, kami berkomitmen memberikan pengalaman jual beli mobil bekas yang jujur, aman, dan berkualitas.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="group rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Gradient Header */}
              <div className={`bg-gradient-to-r ${item.gradient} p-5 sm:p-6 relative overflow-hidden`}>
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-lg" />
                <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10" />
              </div>
              {/* Content */}
              <div className="p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Banner */}
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-700/50 p-6 sm:p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-3 sm:mb-4">
                Komitmen Kami untuk{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Kepuasan Anda
                </span>
              </h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Setiap kendaraan yang kami jual telah melalui proses seleksi dan inspeksi ketat. Kami tidak hanya menjual mobil, tapi juga kepercayaan.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
