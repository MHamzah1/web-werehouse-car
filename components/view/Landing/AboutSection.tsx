"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";

const checklist = [
  "Online Appointment",
  "Test Drive Gratis",
];

export default function AboutSection() {
  return (
    <section className="relative bg-kcunk-surface py-16 sm:py-20 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* LEFT — Image + overlay card */}
          <div className="relative">
            <div className="relative aspect-[4/5] sm:aspect-[5/6] rounded-sm overflow-hidden shadow-2xl bg-kcunk-black">
              <Image
                src="/about-car.jpg"
                alt="K-Cunk Motor - Mobil Bekas Berkualitas"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Dark gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Overlay feature card (bottom-left) */}
            <div className="absolute bottom-6 sm:bottom-8 left-4 sm:left-6 right-4 sm:right-auto sm:max-w-[260px]">
              <div className="bg-kcunk-black text-white p-5 sm:p-6 rounded-sm shadow-2xl border-l-4 border-kcunk-red">
                <div className="w-10 h-10 rounded-sm bg-kcunk-red flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-base sm:text-lg font-black leading-tight mb-1">
                  Inspeksi Ketat
                </h4>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  50+ titik pengecekan untuk setiap unit kendaraan
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Content */}
          <div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-kcunk-red mb-3">
              About Us
            </p>
            <h2 className="kcunk-heading text-3xl sm:text-4xl md:text-5xl text-kcunk-ink mb-5">
              We Provides Best
              <br />
              Solution Vehicles
            </h2>
            <p className="text-sm sm:text-base text-kcunk-slate leading-relaxed mb-6">
              K-Cunk Motor adalah showroom mobil bekas terpercaya di Tulungagung
              yang telah melayani ribuan pelanggan sejak 2007. Kami berkomitmen
              menghadirkan kendaraan berkualitas dengan proses yang jujur,
              aman, dan transparan.
            </p>

            {/* Feature checklist — 2 items inline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {checklist.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-kcunk-red flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm font-bold text-kcunk-ink">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-sm sm:text-base text-kcunk-slate leading-relaxed mb-8">
              Kami menjamin setiap kendaraan telah melewati inspeksi menyeluruh,
              dokumen lengkap, bebas banjir & tabrakan, serta harga yang
              realistis dan kompetitif.
            </p>

            {/* Founder + CTA row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pt-6 border-t border-kcunk-line">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-kcunk-red/10 border-2 border-kcunk-red flex items-center justify-center overflow-hidden">
                  <span className="text-kcunk-red font-black text-lg">SH</span>
                </div>
                <div>
                  <p className="text-sm font-black text-kcunk-ink">
                    Suryono Hadi P.
                  </p>
                  <p className="text-xs text-kcunk-muted font-semibold">
                    Founder &amp; CEO
                  </p>
                </div>
              </div>

              <Link
                href="/tentang"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-kcunk-red hover:bg-kcunk-red-dark text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-md transition-colors"
              >
                Our Services
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
