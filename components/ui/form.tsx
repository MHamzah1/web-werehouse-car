/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  useFormContext,
  Controller,
  FieldPath,
  FieldValues,
} from "react-hook-form";

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
  render: (props: {
    field: {
      onChange: (...event: any[]) => void;
      onBlur: () => void;
      value: any;
      name: TName;
      ref: React.Ref<any>;
    };
    fieldState: {
      invalid: boolean;
      error?: { message?: string };
    };
  }) => React.ReactElement;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ name, render }: FormFieldProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => render({ field, fieldState })}
    />
  );
}

interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

export function FormItem({ children, className = "" }: FormItemProps) {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
}

interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

export function FormLabel({
  children,
  required = false,
  htmlFor,
  className = "",
}: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

interface FormMessageProps {
  children?: React.ReactNode;
  className?: string;
}

export function FormMessage({ children, className = "" }: FormMessageProps) {
  if (!children) return null;

  return <p className={`text-sm text-red-600 mt-1 ${className}`}>{children}</p>;
}

interface FormDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function FormDescription({
  children,
  className = "",
}: FormDescriptionProps) {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`}>{children}</p>
  );
}
