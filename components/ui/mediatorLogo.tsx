import React from "react";
import Link from "next/link";

interface MediatorLogoProps {
  className?: string;
  variant?: "full" | "icon"; // 'full' ada teksnya, 'icon' cuma logonya
  href?: string; // URL tujuan link
}

export const MediatorLogo: React.FC<MediatorLogoProps> = ({
  className = "",
  variant = "full",
  href = "/", // Default ke homepage
}) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 select-none cursor-pointer transition-transform hover:scale-105 ${className}`}
    >
      {/* BAGIAN TEKS (Hanya muncul jika variant 'full') */}
      {variant === "full" && (
        <div className="flex flex-col justify-center">
          <h1 className="leading-none font-black tracking-tighter text-lg md:text-xl">
            <span className="text-slate-900 dark:text-white">MEDIATOR</span>
            <span className="text-blue-600">.COM</span>
          </h1>
          <p className="text-[0.5rem] md:text-[0.55rem] font-medium tracking-[0.25em] text-slate-500 dark:text-slate-400 uppercase mt-0.5">
            Cepat, dan Terpercaya
          </p>
        </div>
      )}
    </Link>
  );
};
