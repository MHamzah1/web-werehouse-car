import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

export interface NumberFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  wrapperClassName?: string;
  showControls?: boolean;
  step?: number;
}

const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
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
      showControls = true,
      step = 1,
      min,
      max,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();

    const inputId = id || props.name || `number-${generatedId}`;

    const handleIncrement = () => {
      const currentValue = Number(value) || 0;
      const newValue = currentValue + step;

      if (max !== undefined && newValue > Number(max)) return;

      const event = {
        target: { value: String(newValue), name: props.name },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange?.(event);
    };

    const handleDecrement = () => {
      const currentValue = Number(value) || 0;
      const newValue = currentValue - step;

      if (min !== undefined && newValue < Number(min)) return;

      const event = {
        target: { value: String(newValue), name: props.name },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange?.(event);
    };

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
          <input
            ref={ref}
            type="number"
            id={inputId}
            disabled={disabled}
            step={step}
            min={min}
            max={max}
            value={value}
            onChange={onChange}
            className={cn(
              "w-full px-4 py-2.5 text-sm text-gray-900 bg-white border rounded-lg transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              error
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 hover:border-gray-400",
              showControls && "pr-20",
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

          {showControls && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={
                  disabled ||
                  (min !== undefined && Number(value) <= Number(min))
                }
                className={cn(
                  "p-1.5 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                )}
                aria-label="Decrease value"
              >
                <Minus size={16} className="text-gray-600" />
              </button>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={
                  disabled ||
                  (max !== undefined && Number(value) >= Number(max))
                }
                className={cn(
                  "p-1.5 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                )}
                aria-label="Increase value"
              >
                <Plus size={16} className="text-gray-600" />
              </button>
            </div>
          )}
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

NumberField.displayName = "NumberField";

export default NumberField;
