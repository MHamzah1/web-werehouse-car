"use client";

import Image from "next/image";
import { Check } from "lucide-react";

const highlights = [
  "Akses katalog mobil terbaru kapan saja & di mana saja",
  "Booking test drive langsung dari aplikasi",
  "Notifikasi unit baru sesuai preferensi Anda",
];

export default function AppDownloadSection() {
  return (
    <section className="relative bg-white py-16 sm:py-20 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* LEFT — Content */}
          <div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-kcunk-red mb-3">
              Mobile Application
            </p>
            <h2 className="kcunk-heading text-3xl sm:text-4xl md:text-5xl text-kcunk-ink mb-5">
              Download Aplikasi
              <br />
              K-Cunk Motor.
            </h2>
            <p className="text-sm sm:text-base text-kcunk-slate leading-relaxed mb-8 max-w-xl">
              Aplikasi resmi K-Cunk Motor hadir untuk memudahkan Anda
              menemukan mobil bekas impian. Jelajahi katalog, bandingkan
              harga, dan hubungi showroom langsung dari genggaman Anda.
            </p>

            {/* Checklist */}
            <ul className="space-y-3 mb-8">
              {highlights.map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-kcunk-red flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm sm:text-base text-kcunk-ink">
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            {/* Download buttons */}
            <p className="text-sm font-bold text-kcunk-red uppercase tracking-wider mb-3">
              Download Now on:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <StoreButton
                store="App Store"
                label="Download on the"
                href="#"
              >
                <AppleLogo className="w-7 h-7" />
              </StoreButton>
              <StoreButton
                store="Google Play"
                label="Get it on"
                href="#"
              >
                <GooglePlayLogo className="w-6 h-6" />
              </StoreButton>
            </div>
          </div>

          {/* RIGHT — Car image */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-lg aspect-[4/3]">
              <Image
                src="/app-car.png"
                alt="Mobil K-Cunk Motor"
                fill
                className="object-contain drop-shadow-[0_30px_40px_rgba(230,57,70,0.35)]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Red glow behind */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
              <div className="w-[60%] h-[40%] rounded-full bg-kcunk-red/20 blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoreButton({
  href,
  label,
  store,
  children,
}: {
  href: string;
  label: string;
  store: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-3 px-5 py-3 bg-kcunk-black hover:bg-kcunk-ink text-white rounded-sm shadow-md transition-colors"
    >
      {children}
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wider text-white/70">
          {label}
        </span>
        <span className="text-sm font-black">{store}</span>
      </span>
    </a>
  );
}

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.564 12.953c-.03-3.11 2.54-4.607 2.656-4.68-1.447-2.116-3.698-2.405-4.497-2.438-1.912-.192-3.735 1.126-4.707 1.126-.974 0-2.462-1.099-4.048-1.068-2.082.031-4.005 1.21-5.076 3.07-2.166 3.75-.553 9.296 1.556 12.339 1.03 1.489 2.255 3.163 3.867 3.105 1.554-.063 2.139-1.005 4.017-1.005 1.878 0 2.404 1.005 4.048.97 1.672-.031 2.729-1.517 3.75-3.015 1.182-1.731 1.667-3.412 1.694-3.497-.037-.016-3.253-1.248-3.26-4.907zM14.516 3.81C15.37 2.78 15.94 1.35 15.782 0c-1.222.05-2.703.81-3.585 1.837-.79.912-1.482 2.365-1.294 3.692 1.363.106 2.76-.692 3.613-1.719z" />
    </svg>
  );
}

function GooglePlayLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#00c3ff"
        d="M3.609 1.814 13.792 12 3.609 22.186c-.235-.219-.384-.535-.384-.893V2.707c0-.358.149-.674.384-.893z"
      />
      <path
        fill="#ffbe00"
        d="m16.02 15.228-2.228-2.228 2.228-2.228 3.22 1.86c.767.443.767 1.548 0 1.991l-3.22.605z"
      />
      <path
        fill="#ff4c54"
        d="m13.792 12 2.228 2.228-12.411 7.958c-.203.117-.447.117-.646 0L13.792 12z"
      />
      <path
        fill="#00d66a"
        d="M3.609 1.814 13.792 12 2.963 1.814c.199-.117.443-.117.646 0z"
      />
    </svg>
  );
}
