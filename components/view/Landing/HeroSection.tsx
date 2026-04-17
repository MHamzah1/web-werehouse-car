"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import Image from "next/image";

const YEARS = Array.from({ length: 16 }, (_, i) => String(2025 - i));
const MAKES = [
  "Toyota",
  "Honda",
  "Daihatsu",
  "Suzuki",
  "Mitsubishi",
  "Nissan",
  "Mazda",
  "BMW",
  "Mercedes-Benz",
  "Audi",
];
const MODELS = [
  "Avanza",
  "Xenia",
  "Innova",
  "Brio",
  "Jazz",
  "Mobilio",
  "Ertiga",
  "Pajero",
  "Fortuner",
  "HR-V",
];
const MILEAGES = [
  "< 20.000 km",
  "20.000 - 50.000 km",
  "50.000 - 100.000 km",
  "> 100.000 km",
];
const TRANSMISSIONS = ["Automatic", "Manual", "CVT", "Semi-Automatic"];
const CONDITIONS = ["Baru", "Bekas", "Seperti Baru", "Perlu Perbaikan"];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export default function HeroSection() {
  const router = useRouter();
  const [priceMax, setPriceMax] = useState(500_000_000);

  const [form, setForm] = useState({
    year: "",
    make: "",
    model: "",
    mileage: "",
    transmission: "",
    condition: "",
  });

  const handleChange =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (form.year) params.set("year", form.year);
    if (form.make) params.set("make", form.make);
    if (form.model) params.set("model", form.model);
    if (form.mileage) params.set("mileage", form.mileage);
    if (form.transmission) params.set("transmission", form.transmission);
    if (form.condition) params.set("condition", form.condition);
    if (priceMax < 2_600_000_000) params.set("priceMax", String(priceMax));
    const qs = params.toString();
    router.push(`/katalog${qs ? `?${qs}` : ""}`);
  };

  return (
    <section className="relative bg-kcunk-black pt-16 lg:pt-20 pb-32 sm:pb-36 md:pb-44 lg:pb-52 overflow-hidden">
      {/* Split background */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-kcunk-red" />
        <div className="w-1/2 bg-kcunk-black" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Giant brand typography */}
        <div className="relative pt-10 sm:pt-14 md:pt-20 lg:pt-24 min-h-[340px] sm:min-h-[450px] md:min-h-[590px] lg:min-h-[690px] xl:min-h-[760px]">
          <h1 className="relative z-10 kcunk-heading text-center leading-[0.9] text-[64px] sm:text-[96px] md:text-[140px] lg:text-[180px] xl:text-[220px] tracking-tighter select-none">
            <span
              className="inline-block text-transparent"
              style={{ WebkitTextStroke: "2px #ffffff" }}
            >
              K
            </span>
            <span className=" text-white">-CUNK</span>
          </h1>

          {/* Car illustration overlaying the typography */}
          <div className="pointer-events-none relative z-20 mt-[-32px] flex justify-center sm:mt-[-52px] md:absolute md:right-[-1.5rem] md:bottom-2 md:mt-0 md:w-[68%] lg:right-[-2rem] lg:bottom-0 lg:w-[72%] xl:right-[-2.5rem] xl:bottom-[-0.5rem] xl:w-[74%]">
            <Image
              src="/Image/car-sedan.png"
              alt="Hero Car Art"
              width={1400}
              height={400}
              priority
              className="h-auto w-full max-w-[520px] object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.5)] sm:max-w-[680px] md:max-w-none"
            />
          </div>
        </div>
      </div>

      {/* Search Bar — overlaps bottom */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 md:-mt-24">
        <div className="bg-white rounded-sm shadow-2xl shadow-black/30 p-5 sm:p-7 md:p-8 border-t-4 border-kcunk-red">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            <SelectField
              label="Select Year"
              value={form.year}
              onChange={handleChange("year")}
              options={YEARS}
            />
            <SelectField
              label="Select Make"
              value={form.make}
              onChange={handleChange("make")}
              options={MAKES}
            />
            <SelectField
              label="Select Model"
              value={form.model}
              onChange={handleChange("model")}
              options={MODELS}
            />

            {/* Price Range */}
            <div className="lg:col-span-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-kcunk-ink mb-1">
                Price
              </label>
              <div className="text-xs text-kcunk-slate mb-2">
                {formatRupiah(7_900_000)} – {formatRupiah(priceMax)}
              </div>
              <input
                type="range"
                min={7_900_000}
                max={2_600_000_000}
                step={1_000_000}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full h-1.5 rounded-full bg-kcunk-line accent-[#e63946] cursor-pointer"
              />
            </div>

            <SelectField
              label="Select Mileage"
              value={form.mileage}
              onChange={handleChange("mileage")}
              options={MILEAGES}
            />
            <SelectField
              label="Select Transmission"
              value={form.transmission}
              onChange={handleChange("transmission")}
              options={TRANSMISSIONS}
            />
            <SelectField
              label="Select Condition"
              value={form.condition}
              onChange={handleChange("condition")}
              options={CONDITIONS}
            />

            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-kcunk-red hover:bg-kcunk-red-dark text-white font-bold text-sm uppercase tracking-wider rounded-sm shadow-md transition-colors"
              >
                <Search className="w-4 h-4" />
                Search Inventory
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-kcunk-ink mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full h-10 px-3 text-sm text-kcunk-ink bg-white border border-kcunk-line rounded-sm outline-none focus:border-kcunk-red transition-colors cursor-pointer"
      >
        <option value="">--Select--</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function HeroCarArt() {
  return (
    <svg
      viewBox="0 0 900 300"
      className="w-full max-w-[820px] h-auto drop-shadow-[0_25px_40px_rgba(0,0,0,0.5)]"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f5f7" />
          <stop offset="45%" stopColor="#e6e6ea" />
          <stop offset="100%" stopColor="#a8a8ad" />
        </linearGradient>
        <linearGradient id="carGlass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d2d33" />
          <stop offset="100%" stopColor="#0b0b0d" />
        </linearGradient>
        <radialGradient id="wheelRim" cx="50%" cy="50%" r="50%">
          <stop offset="40%" stopColor="#1a1a1f" />
          <stop offset="70%" stopColor="#3a3a40" />
          <stop offset="100%" stopColor="#0b0b0d" />
        </radialGradient>
        <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.5)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="450" cy="270" rx="360" ry="14" fill="url(#shadow)" />

      {/* Car body */}
      <path
        d="M120 240 L170 180 Q215 135 280 120 L420 98 Q500 90 580 108 L700 140 Q760 158 790 200 L795 240 Z"
        fill="url(#carBody)"
        stroke="#bcbcc2"
        strokeWidth="1.5"
      />
      {/* Roof cabin */}
      <path
        d="M260 148 Q295 115 360 108 L510 105 Q580 108 630 140 L650 168 L260 168 Z"
        fill="url(#carGlass)"
        opacity="0.95"
      />
      {/* Roof highlight */}
      <path
        d="M280 150 Q310 125 365 120 L505 118 Q575 120 620 148"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.15"
        strokeWidth="2"
      />

      {/* Side skirt */}
      <path
        d="M140 240 L170 225 L770 225 L790 240 Z"
        fill="#1a1a1f"
        opacity="0.7"
      />

      {/* Headlight */}
      <path
        d="M720 170 L782 182 L790 200 L735 198 Z"
        fill="#ffd86b"
        opacity="0.9"
      />
      <path
        d="M720 170 L782 182 L790 200 L735 198 Z"
        fill="url(#carBody)"
        opacity="0.2"
      />
      {/* Taillight */}
      <rect x="135" y="195" width="30" height="14" rx="2" fill="#e63946" />

      {/* Door lines */}
      <path d="M290 168 L290 240" stroke="#9b9ba0" strokeWidth="1.2" />
      <path d="M440 168 L440 240" stroke="#9b9ba0" strokeWidth="1.2" />
      <path d="M575 168 L575 240" stroke="#9b9ba0" strokeWidth="1.2" />

      {/* Handles */}
      <rect x="310" y="200" width="30" height="4" rx="2" fill="#9b9ba0" />
      <rect x="460" y="200" width="30" height="4" rx="2" fill="#9b9ba0" />
      <rect x="595" y="200" width="30" height="4" rx="2" fill="#9b9ba0" />

      {/* Wheels */}
      <g>
        <circle cx="250" cy="245" r="42" fill="#0b0b0d" />
        <circle cx="250" cy="245" r="30" fill="url(#wheelRim)" />
        <circle cx="250" cy="245" r="10" fill="#0b0b0d" />
        {[0, 45, 90, 135].map((rot) => (
          <rect
            key={rot}
            x="248"
            y="220"
            width="4"
            height="50"
            fill="#3a3a40"
            transform={`rotate(${rot} 250 245)`}
          />
        ))}
      </g>
      <g>
        <circle cx="660" cy="245" r="42" fill="#0b0b0d" />
        <circle cx="660" cy="245" r="30" fill="url(#wheelRim)" />
        <circle cx="660" cy="245" r="10" fill="#0b0b0d" />
        {[0, 45, 90, 135].map((rot) => (
          <rect
            key={rot}
            x="658"
            y="220"
            width="4"
            height="50"
            fill="#3a3a40"
            transform={`rotate(${rot} 660 245)`}
          />
        ))}
      </g>
    </svg>
  );
}
