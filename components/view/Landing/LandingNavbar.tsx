"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Beranda", href: "#beranda" },
  { label: "Tentang", href: "#tentang" },
  { label: "Katalog Mobil", href: "#katalog" },
  { label: "Cabang", href: "#cabang" },
  { label: "Kontak", href: "#kontak" },
];

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#020617]/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <span className="text-white font-black text-sm md:text-base">KC</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-base md:text-lg text-white leading-tight">
                K-CUNK MOTOR
              </p>
              <p className="text-[10px] md:text-xs text-gray-400 leading-tight">
                Jual Beli Mobil Bekas Berkualitas
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-orange-400 transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </button>
            ))}
            <Link
              href="/auth/login"
              className="ml-3 px-5 py-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/20"
            >
              Login Staff
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0b0f19]/98 backdrop-blur-lg border-t border-white/5">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left px-4 py-3 text-gray-300 hover:text-orange-400 hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            <Link
              href="/auth/login"
              className="block text-center mt-3 px-5 py-3 text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg"
            >
              Login Staff
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
