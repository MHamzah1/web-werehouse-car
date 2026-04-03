"use client";

import React, { useRef } from "react";
import { FiCamera, FiX } from "react-icons/fi";

interface InspectionPhotoUploadProps {
  photos: File[];
  previews: string[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  maxPhotos?: number;
  isDark: boolean;
}

const InspectionPhotoUpload: React.FC<InspectionPhotoUploadProps> = ({
  photos,
  previews,
  onAdd,
  onRemove,
  maxPhotos = 3,
  isDark,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).slice(
      0,
      maxPhotos - photos.length
    );
    onAdd(newFiles);
    e.target.value = "";
  };

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {previews.map((preview, idx) => (
        <div
          key={idx}
          className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600"
        >
          <img
            src={preview}
            alt={`Foto ${idx + 1}`}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
          >
            <FiX size={10} />
          </button>
        </div>
      ))}

      {photos.length < maxPhotos && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`w-16 h-16 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDark
                ? "border-gray-600 hover:border-teal-400 text-gray-400 hover:text-teal-400"
                : "border-gray-300 hover:border-teal-500 text-gray-400 hover:text-teal-500"
            }`}
          >
            <FiCamera size={18} />
            <span className="text-[9px] mt-0.5">Foto</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};

export default InspectionPhotoUpload;
