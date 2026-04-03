"use client";

import React, { useState } from "react";
import { FiChevronDown, FiChevronUp, FiCheckCircle } from "react-icons/fi";
import {
  InspectionTemplateCategory,
  CONDITION_OPTIONS,
} from "./INSPECTION_TEMPLATE";
import InspectionItemRow, { InspectionItemData } from "./InspectionItemRow";

interface InspectionCategoryCardProps {
  template: InspectionTemplateCategory;
  items: InspectionItemData[];
  onItemChange: (itemCode: string, updated: InspectionItemData) => void;
  isDark: boolean;
}

const InspectionCategoryCard: React.FC<InspectionCategoryCardProps> = ({
  template,
  items,
  onItemChange,
  isDark,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate completion stats
  const filledCount = items.filter((i) => i.condition !== "na").length;
  const totalCount = items.length;
  const isComplete = filledCount === totalCount;

  // Calculate condition summary
  const conditionCounts = items.reduce(
    (acc, item) => {
      if (item.condition !== "na") {
        acc[item.condition] = (acc[item.condition] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const photosCount = items.reduce((acc, item) => acc + item.photos.length, 0);

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-colors ${
        isDark
          ? "bg-slate-800/50 border-slate-700/50"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 sm:p-5 transition-colors ${
          isDark ? "hover:bg-slate-800/80" : "hover:bg-slate-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{template.icon}</span>
          <div className="text-left">
            <h3
              className={`text-base font-semibold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {template.label}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {filledCount}/{totalCount} item
              </span>
              {photosCount > 0 && (
                <span
                  className={`text-xs ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  • {photosCount} foto
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Condition mini summary */}
          <div className="hidden sm:flex items-center gap-1">
            {CONDITION_OPTIONS.filter((o) => o.value !== "na").map((opt) => {
              const count = conditionCounts[opt.value] || 0;
              if (count === 0) return null;
              return (
                <span
                  key={opt.value}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${opt.bg} ${opt.color}`}
                >
                  {count}
                </span>
              );
            })}
          </div>

          {/* Completion indicator */}
          {isComplete && filledCount > 0 && (
            <FiCheckCircle className="text-emerald-500" size={18} />
          )}

          {/* Progress bar */}
          <div
            className={`w-16 h-1.5 rounded-full overflow-hidden ${
              isDark ? "bg-slate-700" : "bg-slate-200"
            }`}
          >
            <div
              className={`h-full rounded-full transition-all ${
                isComplete && filledCount > 0
                  ? "bg-emerald-500"
                  : "bg-teal-500"
              }`}
              style={{
                width: `${totalCount > 0 ? (filledCount / totalCount) * 100 : 0}%`,
              }}
            />
          </div>

          {isOpen ? (
            <FiChevronUp
              className={isDark ? "text-slate-400" : "text-slate-500"}
              size={20}
            />
          ) : (
            <FiChevronDown
              className={isDark ? "text-slate-400" : "text-slate-500"}
              size={20}
            />
          )}
        </div>
      </button>

      {/* Items - Collapsible */}
      {isOpen && (
        <div className={`px-4 sm:px-5 pb-4 sm:pb-5 space-y-3`}>
          <div
            className={`border-t ${
              isDark ? "border-slate-700/50" : "border-slate-100"
            } pt-4`}
          >
            <div className="space-y-3">
              {template.items.map((templateItem) => {
                const itemData = items.find(
                  (i) => i.itemCode === templateItem.code
                );
                if (!itemData) return null;
                return (
                  <InspectionItemRow
                    key={templateItem.code}
                    item={itemData}
                    description={templateItem.description}
                    onChange={(updated) =>
                      onItemChange(templateItem.code, updated)
                    }
                    isDark={isDark}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionCategoryCard;
