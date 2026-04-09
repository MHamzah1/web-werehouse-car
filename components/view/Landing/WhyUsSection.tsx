"use client";

import { ClipboardCheck, Wrench, ShieldCheck, BadgeCheck, Truck, HeartHandshake } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Inspeksi Ketat",
    description: "Kendaraan diperiksa 50+ titik pengecekan oleh tim inspektur profesional.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Wrench,
    step: "02",
    title: "Perbaikan Berkualitas",
    description: "Kendaraan yang perlu perbaikan ditangani oleh mekanik berpengalaman.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Verifikasi Dokumen",
    description: "Kelengkapan dan keabsahan BPKB, STNK, dan dokumen lain diverifikasi.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: BadgeCheck,
    step: "04",
    title: "Siap Jual",
    description: "Hanya kendaraan yang lolos semua tahap yang masuk katalog penjualan.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: HeartHandshake,
    step: "05",
    title: "Proses Mudah",
    description: "Konsultasi gratis via WhatsApp, negosiasi transparan, dan proses cepat.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Truck,
    step: "06",
    title: "Serah Terima",
    description: "Kendaraan disiapkan dan diserahkan dalam kondisi terbaik kepada Anda.",
    gradient: "from-amber-500 to-orange-500",
  },
];

export default function WhyUsSection() {
  return (
    <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-purple-500/10 text-purple-400 text-xs sm:text-sm font-bold border border-purple-500/20 mb-4 sm:mb-6">
            Proses Kami
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4">
            Dari Inspeksi Hingga{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Tangan Anda
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base px-2">
            Setiap kendaraan melewati 6 tahap ketat sebelum sampai ke katalog kami.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="group rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-xl"
            >
              {/* Gradient top strip */}
              <div className={`h-1.5 bg-gradient-to-r ${item.gradient}`} />

              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                      <span className="text-[10px] sm:text-xs text-slate-500 font-mono font-bold tracking-wider">
                        STEP {item.step}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 sm:mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
