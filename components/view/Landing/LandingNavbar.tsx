"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, LogIn, ChevronDown } from "lucide-react";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-kcunk-black shadow-lg shadow-black/40"
          : "bg-kcunk-black/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="kcunk-italic-logo text-2xl lg:text-3xl text-kcunk-red leading-none">
              K<span className="text-white">-Cunk</span>
            </span>
            <span className="kcunk-italic-logo text-2xl lg:text-3xl text-white leading-none tracking-tight">
              Motor
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-1 px-3 xl:px-4 py-2 text-[13px] font-semibold uppercase tracking-wider transition-colors ${
                  isActive(link.href)
                    ? "text-kcunk-red"
                    : "text-white hover:text-kcunk-red"
                }`}
              >
                {link.label}
                {link.label === "Katalog Mobil" && (
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                )}
              </Link>
            ))}

            {/* Search icon */}
            <button
              aria-label="Cari"
              className="ml-2 w-9 h-9 flex items-center justify-center text-white hover:text-kcunk-red transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Login Staff CTA */}
            <Link
              href="/auth/login"
              className="ml-2 inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold uppercase tracking-wider bg-kcunk-red text-white rounded-sm hover:bg-kcunk-red-dark transition-colors shadow-md"
            >
              <LogIn className="w-4 h-4" />
              Login Staff
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-sm text-white hover:text-kcunk-red transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden border-t border-white/10 overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 space-y-1 bg-kcunk-black">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 rounded-sm font-semibold text-sm uppercase tracking-wider transition-colors ${
                isActive(link.href)
                  ? "text-kcunk-red bg-white/5"
                  : "text-white hover:text-kcunk-red hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 mt-2 px-5 py-3 text-sm font-bold uppercase tracking-wider bg-kcunk-red text-white rounded-sm hover:bg-kcunk-red-dark transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Login Staff
          </Link>
        </div>
      </div>
    </nav>
  );
}
