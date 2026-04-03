import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  labelPosition?: "left" | "right";
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
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
      labelPosition = "right",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();

    const inputId = id || props.name || `switch-${generatedId}`;

    return (
      <div className={cn("w-full", wrapperClassName)}>
        <div
          className={cn(
            "flex items-center",
            labelPosition === "left" ? "flex-row-reverse justify-end" : ""
          )}
        >
          <div className="relative inline-block">
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              disabled={disabled}
              checked={checked}
              className={cn("peer sr-only", className)}
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
            <label
              htmlFor={inputId}
              className={cn(
                "flex items-center w-11 h-6 bg-gray-300 rounded-full cursor-pointer transition-colors duration-200",
                "peer-checked:bg-blue-600",
                "peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2",
                "peer-disabled:bg-gray-200 peer-disabled:cursor-not-allowed",
                error && "bg-red-200 peer-checked:bg-red-500"
              )}
            >
              <span
                className={cn(
                  "inline-block w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ml-1",
                  "peer-checked:translate-x-5"
                )}
              />
            </label>
          </div>

          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "text-sm text-gray-700 cursor-pointer select-none",
                labelPosition === "left" ? "mr-3" : "ml-3",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            >
              {label}
            </label>
          )}
        </div>

        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}

        {!error && helperText && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;
