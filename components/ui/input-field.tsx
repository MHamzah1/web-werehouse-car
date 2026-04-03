"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

export interface InputFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  disabled,
}: InputFieldProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div>
      <label
        className={`block text-sm font-medium mb-1.5 ${
          isDark ? "text-slate-300" : "text-slate-700"
        }`}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${
          isDark
            ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500 disabled:opacity-50"
            : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 disabled:opacity-50"
        }`}
      />
    </div>
  );
};

export default InputField;
