import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
  wrapperClassName?: string;
  resize?: "none" | "vertical" | "horizontal" | "both";
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      showCharCount = false,
      maxLength,
      wrapperClassName,
      className,
      id,
      disabled,
      rows = 4,
      resize = "vertical",
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || props.name || `textarea-${generatedId}`;
    const currentLength = value ? String(value).length : 0;

    const resizeClass = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    }[resize];

    return (
      <div className={cn("w-full", wrapperClassName)}>
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "block text-sm font-medium text-gray-700",
                disabled && "opacity-60"
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          {showCharCount && maxLength && (
            <span
              className={cn(
                "text-xs",
                currentLength > maxLength ? "text-red-600" : "text-gray-500"
              )}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className={cn(
            "w-full px-4 py-2.5 text-sm text-gray-900 bg-white border rounded-lg transition-all duration-200",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            error
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 hover:border-gray-400",
            resizeClass,
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />

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

TextArea.displayName = "TextArea";

export default TextArea;
