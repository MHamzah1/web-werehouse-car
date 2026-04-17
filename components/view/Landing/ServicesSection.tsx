"use client";

import {
  CalendarCheck,
  Car,
  ShieldCheck,
  Tag,
} from "lucide-react";

const services = [
  {
    icon: CalendarCheck,
    title: "Janji Temu Online",
    description:
      "Jadwalkan kunjungan ke showroom kami secara online. Tim siap melayani dengan profesional.",
  },
  {
    icon: Car,
    title: "Test Drive Gratis",
    description:
      "Coba langsung mobil impian Anda sebelum membeli. Pastikan sesuai ekspektasi & kebutuhan.",
  },
  {
    icon: ShieldCheck,
    title: "Inspeksi 50+ Titik",
    description:
      "Setiap unit melewati pengecekan ketat: mesin, interior, eksterior, kelistrikan, dan dokumen.",
  },
  {
    icon: Tag,
    title: "Harga Terbaik",
    description:
      "Harga realistis dan transparan, tanpa biaya tersembunyi. Kompetitif se-Tulungagung.",
  },
];

export default function ServicesSection() {
  return (
    <section className="relative bg-white py-16 sm:py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 mb-12 sm:mb-16">
          <div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-kcunk-red mb-3">
              We Provides Best Solution
            </p>
            <h2 className="kcunk-heading text-3xl sm:text-4xl md:text-5xl text-kcunk-ink">
              Mobil Bekas Berkualitas
            </h2>
          </div>
          <div className="flex items-center">
            <p className="text-sm sm:text-base text-kcunk-slate leading-relaxed">
              K-Cunk Motor adalah showroom mobil bekas terpercaya di Tulungagung
              dengan pengalaman lebih dari 17 tahun. Kami menghadirkan unit
              berkualitas, proses transparan, dan pelayanan yang memuaskan
              untuk setiap pelanggan.
            </p>
          </div>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {services.map((item) => (
            <div
              key={item.title}
              className="group relative pt-6 border-t-2 border-kcunk-line hover:border-kcunk-red transition-colors"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm bg-kcunk-red/10 text-kcunk-red mb-4 group-hover:bg-kcunk-red group-hover:text-white transition-colors">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-kcunk-ink mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-kcunk-slate leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
