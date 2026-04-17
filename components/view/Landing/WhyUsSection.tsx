"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

const stats = [
  { value: "1.200+", label: "Mobil Terjual" },
  { value: "17+", label: "Tahun Pengalaman" },
  { value: "3", label: "Cabang Showroom" },
  { value: "50+", label: "Titik Inspeksi" },
];

const VIDEO_URL = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1";

export default function WhyUsSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative">
      {/* VIDEO BLOCK */}
      <div className="relative bg-kcunk-black overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{
            backgroundImage: "url('/landing/why-us-bg.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-kcunk-black via-transparent to-kcunk-red/10" />
        {/* Subtle light streaks */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:py-36">
          <div className="flex flex-col items-center text-center">
            {/* Play button */}
            <button
              onClick={() => setPlaying(true)}
              aria-label="Play promotional video"
              className="group relative mb-6 sm:mb-8"
            >
              <span className="absolute inset-0 rounded-full bg-kcunk-red/30 animate-ping" />
              <span className="absolute inset-0 rounded-full bg-kcunk-red/20 scale-125 animate-pulse" />
              <span className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-kcunk-red text-white shadow-2xl shadow-kcunk-red/50 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
              </span>
            </button>

            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-kcunk-red mb-3">
              Video Promosi
            </p>
            <h2 className="kcunk-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white max-w-3xl">
              Want To Know More About?
              <br />
              Play Our Promotional Video Now!
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/60 max-w-xl">
              Kenali lebih dekat showroom K-Cunk Motor dan komitmen kami dalam
              menghadirkan mobil bekas berkualitas untuk Anda.
            </p>
          </div>
        </div>
      </div>

      {/* STATS STRIP — red */}
      <div className="relative bg-kcunk-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className={`text-center text-white ${
                  idx < stats.length - 1
                    ? "lg:border-r lg:border-white/20"
                    : ""
                } px-2`}
              >
                <p className="kcunk-heading text-3xl sm:text-4xl md:text-5xl text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/80">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VIDEO MODAL */}
      {playing && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPlaying(false)}
        >
          <button
            onClick={() => setPlaying(false)}
            aria-label="Close video"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={VIDEO_URL}
              title="K-Cunk Motor Promotional Video"
              className="absolute inset-0 w-full h-full rounded-sm shadow-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
