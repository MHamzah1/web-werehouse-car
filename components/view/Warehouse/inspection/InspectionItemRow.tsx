"use client";

import React from "react";
import { CONDITION_OPTIONS, ItemConditionType } from "./INSPECTION_TEMPLATE";
import InspectionPhotoUpload from "./InspectionPhotoUpload";

export interface InspectionItemData {
  itemCode: string;
  itemName: string;
  category: string;
  condition: ItemConditionType;
  notes: string;
  photos: File[];
  previews: string[];
}

interface InspectionItemRowProps {
  item: InspectionItemData;
  description?: string;
  onChange: (updated: InspectionItemData) => void;
  isDark: boolean;
}

const InspectionItemRow: React.FC<InspectionItemRowProps> = ({
  item,
  description,
  onChange,
  isDark,
}) => {
  const handleConditionChange = (condition: ItemConditionType) => {
    onChange({ ...item, condition });
  };

  const handleNotesChange = (notes: string) => {
    onChange({ ...item, notes });
  };

  const handlePhotosAdd = (files: File[]) => {
    const newPhotos = [...item.photos, ...files];
    const newPreviews = [
      ...item.previews,
      ...files.map((f) => URL.createObjectURL(f)),
    ];
    onChange({ ...item, photos: newPhotos, previews: newPreviews });
  };

  const handlePhotoRemove = (index: number) => {
    URL.revokeObjectURL(item.previews[index]);
    const newPhotos = item.photos.filter((_, i) => i !== index);
    const newPreviews = item.previews.filter((_, i) => i !== index);
    onChange({ ...item, photos: newPhotos, previews: newPreviews });
  };

  const selectedOption = CONDITION_OPTIONS.find(
    (o) => o.value === item.condition
  );

  return (
    <div
      className={`p-4 rounded-xl border transition-colors ${
        isDark
          ? "bg-slate-800/30 border-slate-700/50"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Header: Code + Name */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isDark
                  ? "bg-slate-700 text-slate-400"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {item.itemCode}
            </span>
            <span
              className={`text-sm font-semibold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {item.itemName}
            </span>
          </div>
          {description && (
            <p
              className={`text-xs mt-0.5 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {description}
            </p>
          )}
        </div>

        {/* Condition badge */}
        {selectedOption && item.condition !== "na" && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedOption.bg} ${selectedOption.color}`}
          >
            {selectedOption.label}
          </span>
        )}
      </div>

      {/* Condition Buttons */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {CONDITION_OPTIONS.map((opt) => {
          const isActive = item.condition === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleConditionChange(opt.value as ItemConditionType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? `${opt.bg} ${opt.color} ring-2 ring-offset-1 ${
                      isDark ? "ring-offset-slate-800" : "ring-offset-white"
                    } ring-current`
                  : isDark
                    ? "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Notes + Photos Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Catatan (opsional)..."
            value={item.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
              isDark
                ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>
        <InspectionPhotoUpload
          photos={item.photos}
          previews={item.previews}
          onAdd={handlePhotosAdd}
          onRemove={handlePhotoRemove}
          maxPhotos={3}
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default InspectionItemRow;
