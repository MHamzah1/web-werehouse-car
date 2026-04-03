import React, { forwardRef, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, FileIcon } from "lucide-react";

export interface FileUploadProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  wrapperClassName?: string;
  onFileChange?: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[]; // e.g., ['image/png', 'image/jpeg']
  showPreview?: boolean;
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
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
      onFileChange,
      maxFiles = 1,
      maxFileSize = 5, // 5MB default
      allowedTypes,
      showPreview = true,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || props.name || `file-upload-${generatedId}`;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (files: FileList | null) => {
      if (!files) return;

      const filesArray = Array.from(files);
      let validFiles = filesArray;

      // Validate file size
      validFiles = validFiles.filter((file) => {
        const fileSizeMB = file.size / (1024 * 1024);
        return fileSizeMB <= maxFileSize;
      });

      // Validate file type
      if (allowedTypes && allowedTypes.length > 0) {
        validFiles = validFiles.filter((file) =>
          allowedTypes.includes(file.type)
        );
      }

      // Limit number of files
      const filesToAdd = validFiles.slice(0, maxFiles);

      setSelectedFiles(filesToAdd);
      onFileChange?.(filesToAdd);
    };

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileChange(e.dataTransfer.files);
      }
    };

    const removeFile = (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
      onFileChange?.(newFiles);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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

        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg transition-all duration-200",
            dragActive
              ? "border-blue-500 bg-blue-50"
              : error
              ? "border-red-300 hover:border-red-400"
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-60 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={(e) => {
              if (ref) {
                if (typeof ref === "function") ref(e);
                else ref.current = e;
              }
              if (fileInputRef) fileInputRef.current = e;
            }}
            type="file"
            id={inputId}
            disabled={disabled}
            className="hidden"
            onChange={(e) => {
              handleFileChange(e.target.files);
              onChange?.(e);
            }}
            accept={allowedTypes?.join(",")}
            multiple={maxFiles > 1}
            {...props}
          />

          <label
            htmlFor={inputId}
            className={cn(
              "flex flex-col items-center justify-center p-8 cursor-pointer",
              disabled && "cursor-not-allowed"
            )}
          >
            <Upload
              size={40}
              className={cn(
                "mb-3",
                dragActive ? "text-blue-500" : "text-gray-400"
              )}
            />
            <p className="text-sm text-gray-700 font-medium mb-1">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-gray-500">
              {allowedTypes
                ? `Allowed: ${allowedTypes
                    .map((t) => t.split("/")[1])
                    .join(", ")}`
                : "Any file type"}{" "}
              (Max {maxFileSize}MB)
            </p>
          </label>
        </div>

        {/* File Preview */}
        {showPreview && selectedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileIcon size={20} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                  disabled={disabled}
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}

        {!error && helperText && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";

export default FileUpload;
