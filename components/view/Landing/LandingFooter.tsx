"use client";

import Link from "next/link";
import { Car } from "lucide-react";

const menuLinks = [
  { label: "Beranda", href: "/" },
  { label: "Katalog Mobil", href: "/katalog" },
  { label: "Tentang Kami", href: "/tentang" },
  { label: "Cabang Kami", href: "/cabang" },
  { label: "Kontak", href: "/kontak" },
];

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-slate-800">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-sm text-white tracking-wide">
                  K-CUNK MOTOR
                </p>
                <p className="text-[9px] text-slate-500 tracking-widest uppercase">
                  Cepat, dan Terpercaya
                </p>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Showroom mobil bekas terpercaya di Tulungagung sejak 2007.
              Menyediakan kendaraan berkualitas dengan proses transparan.
            </p>
          </div>

          {/* Menu */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white mb-3 lg:mb-5 uppercase tracking-wider">
              Menu
            </h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-slate-500 hover:text-cyan-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Layanan */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white mb-3 lg:mb-5 uppercase tracking-wider">
              Layanan
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-slate-500">
              <li>Jual Beli Mobil Bekas</li>
              <li>Inspeksi Kendaraan</li>
              <li>Tukar Tambah</li>
              <li>Konsultasi Gratis</li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white mb-3 lg:mb-5 uppercase tracking-wider">
              Kontak
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-slate-500">
              <li>WA: +62 815-7486-5632</li>
              <li>Sen - Sab: 08:00 - 20:00</li>
              <li>Minggu: 09:00 - 17:00</li>
              <li className="pt-1">
                Jl. Raya Prigi, Tulunkulon,
                <br />
                Kec. Bandung, Tulungagung
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] sm:text-xs text-slate-600">
            &copy; {currentYear} K-CUNK MOTOR. All rights reserved.
          </p>
          <p className="text-[10px] sm:text-xs text-slate-600">
            Powered by{" "}
            <span className="text-slate-500 font-medium">
              Mediator Warehouse System
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
