"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { FiX, FiCamera, FiRefreshCw } from "react-icons/fi";
import { useTheme } from "@/context/ThemeContext";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [useFrontCamera, setUseFrontCamera] = useState(false);
  const hasScannedRef = useRef(false);
  const mountedRef = useRef(true);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // ignore cleanup errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScanner = useCallback(
    async (frontCamera: boolean) => {
      await stopScanner();

      // Step 1: Request camera permission explicitly first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: frontCamera ? "user" : "environment",
          },
        });
        // Stop the permission-request stream immediately
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        if (mountedRef.current) {
          setError(
            "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di pengaturan browser.",
          );
        }
        return;
      }

      // Step 2: Start the scanner using facingMode constraint
      try {
        const scanner = new Html5Qrcode("qr-scanner-region");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: frontCamera ? "user" : "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (!hasScannedRef.current) {
              hasScannedRef.current = true;
              stopScanner();
              onScanSuccess(decodedText);
            }
          },
          () => {
            // ignore scan failure (no QR code found yet)
          },
        );

        if (mountedRef.current) {
          setIsScanning(true);
          setError("");
        }
      } catch {
        if (mountedRef.current) {
          setError(
            "Gagal memulai kamera. Pastikan tidak ada aplikasi lain yang menggunakan kamera.",
          );
          setIsScanning(false);
        }
      }
    },
    [stopScanner, onScanSuccess],
  );

  useEffect(() => {
    mountedRef.current = true;

    if (!isOpen) return;

    hasScannedRef.current = false;
    setError("");
    startScanner(useFrontCamera);

    return () => {
      mountedRef.current = false;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, useFrontCamera]);

  const handleSwitchCamera = () => {
    setUseFrontCamera((prev) => !prev);
  };

  const handleClose = () => {
    stopScanner();
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
          isDark
            ? "bg-slate-900 border border-slate-700/50"
            : "bg-white border border-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? "border-slate-700/50" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <FiCamera className="text-emerald-500 text-lg" />
            <h2
              className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Scan QR Code
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSwitchCamera}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "hover:bg-slate-700/50 text-slate-400"
                  : "hover:bg-slate-100 text-slate-500"
              }`}
              title={
                useFrontCamera
                  ? "Ganti ke kamera belakang"
                  : "Ganti ke kamera depan"
              }
            >
              <FiRefreshCw className="text-lg" />
            </button>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "hover:bg-slate-700/50 text-slate-400"
                  : "hover:bg-slate-100 text-slate-500"
              }`}
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Scanner Area */}
        <div className="px-5 py-4 space-y-4">
          {/* Scanner viewport */}
          <div
            className={`relative rounded-xl overflow-hidden ${
              isDark ? "bg-slate-800" : "bg-slate-100"
            }`}
          >
            <div id="qr-scanner-region" className="w-full" />
            {!isScanning && !error && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                <p
                  className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  Meminta akses kamera...
                </p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="space-y-3">
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
              <button
                onClick={() => startScanner(useFrontCamera)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-sm font-medium transition-colors"
              >
                <FiRefreshCw /> Coba Lagi
              </button>
            </div>
          )}

          {/* Hint */}
          <p
            className={`text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            Arahkan kamera ke QR code kendaraan
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
