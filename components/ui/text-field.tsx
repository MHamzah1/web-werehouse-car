import React, { forwardRef, Ref, useId } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "ref"> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconClick?: () => void;
  wrapperClassName?: string;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onRightIconClick,
      wrapperClassName,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || props.name || `input-${generatedId}`;

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
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <LeftIcon size={20} />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-2.5 text-sm text-gray-900 bg-white border rounded-lg transition-all duration-200",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
              error
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 hover:border-gray-400",
              LeftIcon && "pl-10",
              RightIcon && "pr-10",
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

          {RightIcon && (
            <div
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400",
                onRightIconClick && "cursor-pointer hover:text-gray-600"
              )}
              onClick={onRightIconClick}
            >
              <RightIcon size={20} />
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

TextField.displayName = "TextField";

export default TextField;
