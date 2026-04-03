import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      wrapperClassName,
      className,
      id,
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();

    const inputId = id || props.name || `checkbox-${generatedId}`;

    return (
      <div className={cn("w-full", wrapperClassName)}>
        <div className="flex items-start">
          <div className="relative flex items-center">
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              disabled={disabled}
              checked={checked}
              className={cn(
                "peer w-5 h-5 appearance-none border-2 rounded transition-all duration-200 cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "disabled:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-300",
                error
                  ? "border-red-300"
                  : "border-gray-300 hover:border-gray-400",
                "checked:bg-blue-600 checked:border-blue-600 checked:hover:bg-blue-700 checked:hover:border-blue-700",
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
            <Check
              size={16}
              className={cn(
                "absolute left-0.5 top-0.5 text-white pointer-events-none opacity-0 transition-opacity duration-200",
                "peer-checked:opacity-100"
              )}
              strokeWidth={3}
            />
          </div>

          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "ml-2.5 text-sm text-gray-700 cursor-pointer select-none",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            >
              {label}
            </label>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-sm text-gray-500 ml-7"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
