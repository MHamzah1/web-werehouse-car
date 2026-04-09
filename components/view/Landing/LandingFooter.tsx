"use client";

import React from "react";
import Link from "next/link";

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="absolute inset-0 bg-[#020617]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">KC</span>
              </div>
              <div>
                <p className="font-bold text-white">K-CUNK MOTOR</p>
                <p className="text-xs text-gray-500">Jual Beli Mobil Bekas Berkualitas</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Showroom mobil bekas terpercaya di Tulungagung sejak 2007.
              Menyediakan kendaraan berkualitas dengan proses yang transparan.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Menu
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Beranda", href: "#beranda" },
                { label: "Tentang Kami", href: "#tentang" },
                { label: "Katalog Mobil", href: "#katalog" },
                { label: "Cabang", href: "#cabang" },
                { label: "Kontak", href: "#kontak" },
              ].map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-sm text-gray-500 hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Kontak
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>WhatsApp: +62 815-7486-5632</li>
              <li>Senin - Sabtu: 08:00 - 20:00 WIB</li>
              <li>Minggu: 09:00 - 17:00 WIB</li>
              <li className="pt-2">
                Jl. Raya Prigi, Sripit, Talunkulon,
                <br />
                Kec. Bandung, Tulungagung
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {currentYear} K-CUNK MOTOR. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Powered by{" "}
            <span className="text-gray-500 font-medium">Mediator Warehouse System</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
