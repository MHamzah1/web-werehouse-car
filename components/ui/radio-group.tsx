import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string | number;
  label: string;
  helperText?: string;
  disabled?: boolean;
}

export interface RadioGroupProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: RadioOption[];
  wrapperClassName?: string;
  orientation?: "vertical" | "horizontal";
}

const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      wrapperClassName,
      className,
      name,
      disabled,
      orientation = "vertical",
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();

    const groupName = name || `radio-${generatedId}`;

    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <label
            className={cn(
              "block text-sm font-medium text-gray-700 mb-2",
              disabled && "opacity-60"
            )}
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "space-y-3",
            orientation === "horizontal" && "flex flex-wrap gap-6 space-y-0"
          )}
        >
          {options.map((option, index) => {
            const optionId = `${groupName}-${option.value}`;
            const isChecked = value === option.value;
            const isDisabled = disabled || option.disabled;

            return (
              <div key={option.value} className="flex items-start">
                <div className="relative flex items-center">
                  <input
                    ref={index === 0 ? ref : undefined}
                    type="radio"
                    id={optionId}
                    name={groupName}
                    value={option.value}
                    disabled={isDisabled}
                    checked={isChecked}
                    onChange={onChange}
                    className={cn(
                      "peer w-5 h-5 appearance-none border-2 rounded-full transition-all duration-200 cursor-pointer",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      "disabled:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-300",
                      error
                        ? "border-red-300"
                        : "border-gray-300 hover:border-gray-400",
                      "checked:border-blue-600 checked:hover:border-blue-700",
                      className
                    )}
                    aria-invalid={error ? "true" : "false"}
                    {...props}
                  />
                  <div
                    className={cn(
                      "absolute left-1.5 top-1.5 w-2 h-2 bg-blue-600 rounded-full opacity-0 transition-opacity duration-200 pointer-events-none",
                      "peer-checked:opacity-100"
                    )}
                  />
                </div>

                <div className="ml-2.5">
                  <label
                    htmlFor={optionId}
                    className={cn(
                      "text-sm text-gray-700 cursor-pointer select-none",
                      isDisabled && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {option.label}
                  </label>
                  {option.helperText && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {option.helperText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}

        {!error && helperText && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export default RadioGroup;
