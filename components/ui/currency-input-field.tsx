"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

export interface CurrencyInputFieldProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const CurrencyInputField = ({
  label,
  name,
  value,
  onChange,
  required,
  placeholder = "0",
  disabled,
}: CurrencyInputFieldProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const formatDisplay = (num: number) =>
    num === 0 ? "" : num.toLocaleString("id-ID");

  const [display, setDisplay] = useState(formatDisplay(value));

  useEffect(() => {
    setDisplay(formatDisplay(value));
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, "").replace(/[^\d]/g, "");
    const numeric = raw === "" ? 0 : parseInt(raw, 10);

    setDisplay(numeric === 0 ? "" : numeric.toLocaleString("id-ID"));

    const syntheticEvent = {
      ...e,
      target: { ...e.target, name, value: String(numeric) },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
  };

  return (
    <div>
      <label
        className={`block text-sm font-medium mb-1.5 ${
          isDark ? "text-slate-300" : "text-slate-700"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <span
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium select-none ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Rp
        </span>
        <input
          type="text"
          inputMode="numeric"
          name={name}
          value={display}
          onChange={handleInput}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${
            isDark
              ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500 disabled:opacity-50"
              : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 disabled:opacity-50"
          }`}
        />
      </div>
    </div>
  );
};

export default CurrencyInputField;
