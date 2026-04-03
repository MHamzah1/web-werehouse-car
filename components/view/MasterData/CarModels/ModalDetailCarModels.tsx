/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Car,
  Tag,
  FileText,
  DollarSign,
  Link as LinkIcon,
  Calendar,
  Clock,
  Loader2,
  AlertTriangle,
  Edit,
  Copy,
  Check,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { AppDispatch, RootState } from "@/lib/state/store";

import { Button } from "@/components/ui";
import Alert from "@/components/feature/alert/alert";
import { generateEditUrl } from "@/lib/slug/slug";
import { useRouter } from "next/navigation";
import {
  CarModels,
  clearSelectedCarModels,
  getCarModelsById,
} from "@/lib/state/slice/car-models/CarModelsSlice";

// ============================================
// Types
// ============================================
interface ModalDetailCarModelProps {
  isOpen: boolean;
  onClose: () => void;
  carModelId: string | null;
  onEdit?: (carModel: CarModels) => void;
}

// Format currency
const formatCurrency = (value: string | number) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

// ============================================
// Component
// ============================================
export default function ModalDetailCarModel({
  isOpen,
  onClose,
  carModelId,
  onEdit,
}: ModalDetailCarModelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const { selectedCarModels, loading, error } = useSelector(
    (state: RootState) => state.CarModels
  );

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // ============================================
  // Mount check for Portal
  // ============================================
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // ============================================
  // Fetch Car Model Data
  // ============================================
  useEffect(() => {
    if (isOpen && carModelId) {
      dispatch(getCarModelsById(carModelId));
    }

    return () => {
      if (!isOpen) {
        dispatch(clearSelectedCarModels());
      }
    };
  }, [isOpen, carModelId, dispatch]);

  // ============================================
  // Lock body scroll when modal is open
  // ============================================
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // ============================================
  // Handlers
  // ============================================
  const handleClose = () => {
    dispatch(clearSelectedCarModels());
    onClose();
  };

  const handleEdit = () => {
    if (selectedCarModels) {
      if (onEdit) {
        onEdit(selectedCarModels);
      } else {
        const editUrl = generateEditUrl(
          "/MasterData/CarModel/Edit",
          selectedCarModels.id
        );
        router.push(editUrl);
      }
      handleClose();
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      Alert.toast.success("Berhasil disalin!");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      Alert.toast.error("Gagal menyalin");
    }
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // ============================================
  // Helper Functions
  // ============================================
  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMMM yyyy, HH:mm", { locale: localeId });
  };

  // ============================================
  // Don't render if not open or not mounted
  // ============================================
  if (!isOpen || !mounted) return null;

  // ============================================
  // Detail Item Component
  // ============================================
  const DetailItem = ({
    icon: Icon,
    label,
    value,
    copyable = false,
    highlight = false,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | null | undefined;
    copyable?: boolean;
    highlight?: boolean;
  }) => (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl transition-colors",
        isDarkMode
          ? "bg-slate-800/50 hover:bg-slate-800"
          : "bg-slate-50 hover:bg-slate-100"
      )}
    >
      <div
        className={cn(
          "p-2.5 rounded-lg flex-shrink-0",
          isDarkMode
            ? "bg-cyan-500/20 text-cyan-400"
            : "bg-cyan-100 text-cyan-600"
        )}
      >
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-xs font-medium mb-1",
            isDarkMode ? "text-slate-400" : "text-slate-500"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "text-sm font-semibold break-all",
            highlight
              ? isDarkMode
                ? "text-cyan-400"
                : "text-cyan-600"
              : isDarkMode
              ? "text-white"
              : "text-slate-900"
          )}
        >
          {value || "-"}
        </p>
      </div>
      {copyable && value && (
        <button
          onClick={() => handleCopy(value, label)}
          className={cn(
            "p-2 rounded-lg transition-colors flex-shrink-0",
            isDarkMode
              ? "hover:bg-slate-700 text-slate-400 hover:text-white"
              : "hover:bg-slate-200 text-slate-500 hover:text-slate-700"
          )}
          title="Salin"
        >
          {copiedField === label ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <Copy size={16} />
          )}
        </button>
      )}
    </div>
  );

  // ============================================
  // Modal Content
  // ============================================
  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl",
          isDarkMode
            ? "bg-slate-900 border border-slate-700"
            : "bg-white border border-slate-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={cn(
            "sticky top-0 z-10 px-6 py-4 border-b",
            isDarkMode
              ? "bg-slate-900 border-slate-700"
              : "bg-white border-slate-200"
          )}
        >
          <div className="flex items-center justify-between">
            <h2
              id="modal-title"
              className={cn(
                "text-xl font-bold",
                isDarkMode ? "text-white" : "text-slate-900"
              )}
            >
              Detail Car Model
            </h2>
            <button
              onClick={handleClose}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDarkMode
                  ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                  : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
              )}
              aria-label="Tutup modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
              <p
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                )}
              >
                Memuat data car model...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div
                className={cn(
                  "p-4 rounded-full",
                  isDarkMode ? "bg-red-500/20" : "bg-red-100"
                )}
              >
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <p
                className={cn(
                  "text-sm text-center",
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                )}
              >
                {error}
              </p>
              <Button variant="outline" size="sm" onClick={handleClose}>
                Tutup
              </Button>
            </div>
          )}

          {/* Car Model Data */}
          {selectedCarModels && !loading && !error && (
            <div className="p-6 space-y-6">
              {/* Image & Name Header */}
              <div className="flex flex-col items-center text-center">
                {/* Car Image */}
                <div
                  className={cn(
                    "w-full aspect-video rounded-2xl flex items-center justify-center mb-4 overflow-hidden",
                    selectedCarModels.imageUrl
                      ? ""
                      : "bg-gradient-to-br from-cyan-500 to-blue-600"
                  )}
                >
                  {selectedCarModels.imageUrl ? (
                    <img
                      src={selectedCarModels.imageUrl}
                      alt={selectedCarModels.modelName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Car size={64} className="text-white" />
                  )}
                </div>

                {/* Brand Badge */}
                {selectedCarModels.brand && (
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full mb-3",
                      isDarkMode ? "bg-slate-800" : "bg-slate-100"
                    )}
                  >
                    {selectedCarModels.brand.logo && (
                      <img
                        src={selectedCarModels.brand.logo}
                        alt={selectedCarModels.brand.name}
                        className="w-5 h-5 rounded object-contain"
                      />
                    )}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      )}
                    >
                      {selectedCarModels.brand.name}
                    </span>
                  </div>
                )}

                {/* Model Name */}
                <h3
                  className={cn(
                    "text-xl font-bold mb-2",
                    isDarkMode ? "text-white" : "text-slate-900"
                  )}
                >
                  {selectedCarModels.modelName}
                </h3>

                {/* Price */}
                <p
                  className={cn(
                    "text-2xl font-bold mb-3",
                    isDarkMode ? "text-cyan-400" : "text-cyan-600"
                  )}
                >
                  {selectedCarModels.basePrice
                    ? formatCurrency(selectedCarModels.basePrice)
                    : "-"}
                </p>

                {/* Status Badge */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold",
                    selectedCarModels.isActive
                      ? isDarkMode
                        ? "bg-green-500/20 text-green-400"
                        : "bg-green-100 text-green-700"
                      : isDarkMode
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-orange-100 text-orange-700"
                  )}
                >
                  {selectedCarModels.isActive ? (
                    <CheckCircle size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                  {selectedCarModels.isActive ? "Aktif" : "Tidak Aktif"}
                </span>
              </div>

              {/* Divider */}
              <div
                className={cn(
                  "border-t",
                  isDarkMode ? "border-slate-700" : "border-slate-200"
                )}
              />

              {/* Car Model Information */}
              <div>
                <h4
                  className={cn(
                    "text-sm font-semibold mb-3 flex items-center gap-2",
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  )}
                >
                  <Car size={16} className="text-cyan-500" />
                  Informasi Model
                </h4>
                <div className="space-y-3">
                  <DetailItem
                    icon={Car}
                    label="Nama Model"
                    value={selectedCarModels.modelName}
                    copyable
                  />
                  <DetailItem
                    icon={Tag}
                    label="Brand"
                    value={selectedCarModels.brand?.name}
                  />
                  <DetailItem
                    icon={FileText}
                    label="Deskripsi"
                    value={selectedCarModels.description}
                  />
                  <DetailItem
                    icon={DollarSign}
                    label="Harga Dasar"
                    value={
                      selectedCarModels.basePrice
                        ? formatCurrency(selectedCarModels.basePrice)
                        : null
                    }
                    highlight
                  />
                  <DetailItem
                    icon={LinkIcon}
                    label="URL Gambar"
                    value={selectedCarModels.imageUrl}
                    copyable
                  />
                </div>
              </div>

              {/* Divider */}
              <div
                className={cn(
                  "border-t",
                  isDarkMode ? "border-slate-700" : "border-slate-200"
                )}
              />

              {/* Timestamps */}
              <div>
                <h4
                  className={cn(
                    "text-sm font-semibold mb-3 flex items-center gap-2",
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  )}
                >
                  <Clock size={16} className="text-cyan-500" />
                  Informasi Waktu
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={cn(
                      "p-4 rounded-xl",
                      isDarkMode ? "bg-slate-800/50" : "bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar
                        size={16}
                        className={
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }
                      />
                      <p
                        className={cn(
                          "text-xs font-medium",
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        )}
                      >
                        Dibuat
                      </p>
                    </div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900"
                      )}
                    >
                      {selectedCarModels.createdAt
                        ? formatDate(selectedCarModels.createdAt)
                        : "-"}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-xl",
                      isDarkMode ? "bg-slate-800/50" : "bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock
                        size={16}
                        className={
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }
                      />
                      <p
                        className={cn(
                          "text-xs font-medium",
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        )}
                      >
                        Diperbarui
                      </p>
                    </div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900"
                      )}
                    >
                      {selectedCarModels.updatedAt
                        ? formatDate(selectedCarModels.updatedAt)
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Car Model ID */}
              <div
                className={cn(
                  "p-4 rounded-xl",
                  isDarkMode ? "bg-slate-800/30" : "bg-slate-100"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-xs font-medium mb-1",
                        isDarkMode ? "text-slate-500" : "text-slate-500"
                      )}
                    >
                      Car Model ID
                    </p>
                    <p
                      className={cn(
                        "text-xs font-mono break-all",
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                      )}
                    >
                      {selectedCarModels.id}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(String(selectedCarModels.id), "Car Model ID")
                    }
                    className={cn(
                      "p-2 rounded-lg transition-colors flex-shrink-0 ml-2",
                      isDarkMode
                        ? "hover:bg-slate-700 text-slate-400 hover:text-white"
                        : "hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                    )}
                    title="Salin ID"
                  >
                    {copiedField === "Car Model ID" ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedCarModels && !loading && !error && (
          <div
            className={cn(
              "sticky bottom-0 px-6 py-4 border-t flex gap-3",
              isDarkMode
                ? "bg-slate-900 border-slate-700"
                : "bg-white border-slate-200"
            )}
          >
            <Button
              variant="outline"
              fullWidth
              onClick={handleClose}
              className={
                isDarkMode
                  ? "border-slate-600 text-slate-300 hover:bg-slate-800"
                  : ""
              }
            >
              Tutup
            </Button>
            <Button
              variant="primary"
              fullWidth
              leftIcon={Edit}
              onClick={handleEdit}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              Edit Car Model
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // ============================================
  // Render with Portal to body
  // ============================================
  return createPortal(modalContent, document.body);
}
