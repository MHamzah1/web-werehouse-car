"use client";

import React, { forwardRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export interface PhoneInputFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "ref" | "onChange" | "value"
> {
  label?: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (fullValue: string) => void;
  error?: string;
  required?: boolean;
  icon?: React.ElementType;
}

/**
 * Phone input field with fixed "62" prefix.
 * Stores and returns the full value including "62" prefix.
 * Displays only the part after "62" in the input.
 */
const PhoneInputField = forwardRef<HTMLInputElement, PhoneInputFieldProps>(
  (
    {
      label,
      name,
      value = "",
      onChange,
      onValueChange,
      error,
      required,
      disabled,
      placeholder = "8123456789",
      icon: Icon,
      className,
      ...props
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Strip "62" prefix for display
    const displayValue = value.startsWith("62") ? value.slice(2) : value;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, ""); // only digits
      const fullValue = "62" + raw;

      if (onValueChange) {
        onValueChange(fullValue);
      }

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, name, value: fullValue },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className="space-y-1">
        {label && (
          <label
            className={cn(
              "block text-sm font-medium mb-1.5",
              isDark ? "text-slate-300" : "text-slate-700",
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex">
          {Icon && (
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 z-10",
                isDark ? "text-slate-500" : "text-gray-400",
              )}
            >
              <Icon size={20} />
            </div>
          )}
          <span
            className={cn(
              "inline-flex items-center px-3 text-sm font-medium border border-r-0 rounded-l-xl select-none",
              Icon ? "pl-10" : "",
              isDark
                ? "bg-slate-700 border-slate-600/50 text-slate-300"
                : "bg-gray-100 border-slate-300 text-slate-600",
              disabled && "opacity-50",
            )}
          >
            +62
          </span>
          <input
            ref={ref}
            type="tel"
            name={name}
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-2.5 border rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors",
              isDark
                ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500 disabled:opacity-50"
                : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 disabled:opacity-50",
              error && "border-red-500",
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

PhoneInputField.displayName = "PhoneInputField";

export default PhoneInputField;
