"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Car, LogIn } from "lucide-react";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Katalog Mobil", href: "/katalog" },
  { label: "Tentang Kami", href: "/tentang" },
  { label: "Cabang", href: "/cabang" },
  { label: "Kontak", href: "/kontak" },
];

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-slate-900/95 backdrop-blur-xl shadow-xl shadow-black/20"
          : "bg-slate-900/50 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-shadow">
                <Car className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="font-black text-sm lg:text-base text-white tracking-wide leading-tight">
                K-CUNK MOTOR
              </p>
              <p className="text-[9px] lg:text-[10px] text-slate-400 font-medium tracking-widest uppercase leading-tight">
                Cepat, dan Terpercaya
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 xl:px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-cyan-400 bg-slate-800/50"
                    : "text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="ml-3 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:brightness-110 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
            >
              <LogIn className="w-4 h-4" />
              Login Staff
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden border-t border-slate-800/50 backdrop-blur-xl overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 space-y-1 bg-slate-900/95">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                isActive(link.href)
                  ? "text-cyan-400 bg-cyan-500/10"
                  : "text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 mt-2 px-5 py-3 text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl"
          >
            <LogIn className="w-4 h-4" />
            Login Staff
          </Link>
        </div>
      </div>
    </nav>
  );
}
