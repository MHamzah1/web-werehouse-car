import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  wrapperClassName?: string;
  showIcon?: boolean;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      wrapperClassName,
      className,
      id,
      disabled,
      showIcon = true,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();

    const inputId = id || props.name || `date-${generatedId}`;

    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium text-gray-700 mb-1.5",
              disabled && "opacity-60"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {showIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Calendar size={20} />
            </div>
          )}

          <input
            ref={ref}
            type="date"
            id={inputId}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-2.5 text-sm text-gray-900 bg-white border rounded-lg transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
              "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
              error
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 hover:border-gray-400",
              showIcon && "pl-10",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
