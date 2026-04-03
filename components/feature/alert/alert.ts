/* eslint-disable @typescript-eslint/no-explicit-any */
import Swal, { SweetAlertIcon, SweetAlertResult } from "sweetalert2";

// ============================================
// Types & Interfaces
// ============================================

export interface AlertOptions {
  title?: string;
  text?: string;
  html?: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  timer?: number;
  timerProgressBar?: boolean;
  allowOutsideClick?: boolean;
  allowEscapeKey?: boolean;
  customClass?: {
    popup?: string;
    title?: string;
    confirmButton?: string;
    cancelButton?: string;
    actions?: string;
  };
}

export interface DeleteAlertOptions {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  itemName?: string;
}

export interface InputAlertOptions {
  title?: string;
  text?: string;
  inputPlaceholder?: string;
  inputValue?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  inputValidator?: (value: string) => string | null;
}

// ============================================
// Default Styling (Dark Theme Compatible)
// ============================================

const defaultCustomClass = {
  popup:
    "!bg-slate-800 !rounded-2xl !border !border-slate-700 !shadow-2xl !shadow-black/50",
  title: "!text-white !font-bold",
  htmlContainer: "!text-slate-300",
  confirmButton:
    "!bg-gradient-to-r !from-cyan-500 !to-blue-600 !text-white !font-semibold !px-6 !py-2.5 !rounded-xl !shadow-lg !shadow-cyan-500/30 hover:!shadow-cyan-500/50 !transition-all !duration-200",
  cancelButton:
    "!bg-slate-700 !text-slate-300 !font-semibold !px-6 !py-2.5 !rounded-xl hover:!bg-slate-600 !transition-all !duration-200",
  actions: "!gap-3",
  input:
    "!bg-slate-700 !border-slate-600 !text-white !rounded-xl !placeholder-slate-400",
};

const deleteCustomClass = {
  ...defaultCustomClass,
  confirmButton:
    "!bg-gradient-to-r !from-red-500 !to-red-600 !text-white !font-semibold !px-6 !py-2.5 !rounded-xl !shadow-lg !shadow-red-500/30 hover:!shadow-red-500/50 !transition-all !duration-200",
};

const successCustomClass = {
  ...defaultCustomClass,
  confirmButton:
    "!bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !font-semibold !px-6 !py-2.5 !rounded-xl !shadow-lg !shadow-green-500/30 hover:!shadow-green-500/50 !transition-all !duration-200",
};

const warningCustomClass = {
  ...defaultCustomClass,
  confirmButton:
    "!bg-gradient-to-r !from-amber-500 !to-orange-600 !text-white !font-semibold !px-6 !py-2.5 !rounded-xl !shadow-lg !shadow-amber-500/30 hover:!shadow-amber-500/50 !transition-all !duration-200",
};

// ============================================
// Base Alert Functions
// ============================================

/**
 * Show a basic alert
 */
export const showAlert = (options: AlertOptions): Promise<SweetAlertResult> => {
  return Swal.fire({
    icon: options.icon || "info",
    title: options.title || "Info",
    text: options.text,
    html: options.html,
    confirmButtonText: options.confirmButtonText || "OK",
    cancelButtonText: options.cancelButtonText || "Batal",
    showCancelButton: options.showCancelButton || false,
    showConfirmButton: options.showConfirmButton !== false,
    timer: options.timer,
    timerProgressBar: options.timerProgressBar || false,
    allowOutsideClick: options.allowOutsideClick !== false,
    allowEscapeKey: options.allowEscapeKey !== false,
    customClass: options.customClass || defaultCustomClass,
    buttonsStyling: false,
  });
};

/**
 * Show success alert
 */
export const showSuccess = (
  title: string = "Berhasil!",
  text?: string,
  timer?: number
): Promise<SweetAlertResult> => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonText: "OK",
    timer: timer || 2000,
    timerProgressBar: true,
    customClass: successCustomClass,
    buttonsStyling: false,
  });
};

/**
 * Show error alert
 */
export const showError = (
  title: string = "Error!",
  text?: string
): Promise<SweetAlertResult> => {
  return Swal.fire({
    icon: "error",
    title,
    text: text || "Terjadi kesalahan. Silakan coba lagi.",
    confirmButtonText: "OK",
    customClass: deleteCustomClass,
    buttonsStyling: false,
  });
};

/**
 * Show warning alert
 */
export const showWarning = (
  title: string = "Peringatan!",
  text?: string
): Promise<SweetAlertResult> => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonText: "OK",
    customClass: warningCustomClass,
    buttonsStyling: false,
  });
};

/**
 * Show info alert
 */
export const showInfo = (
  title: string = "Informasi",
  text?: string
): Promise<SweetAlertResult> => {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonText: "OK",
    customClass: defaultCustomClass,
    buttonsStyling: false,
  });
};

// ============================================
// Confirmation Alerts
// ============================================

/**
 * Show delete confirmation alert
 */
export const showDeleteConfirm = async (
  options: DeleteAlertOptions = {}
): Promise<boolean> => {
  const result = await Swal.fire({
    icon: "warning",
    title: options.title || "Hapus Data?",
    html:
      options.text ||
      `Apakah Anda yakin ingin menghapus ${
        options.itemName
          ? `<strong class="text-red-400">${options.itemName}</strong>`
          : "data ini"
      }?<br><span class="text-sm text-slate-400">Tindakan ini tidak dapat dibatalkan.</span>`,
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || "Ya, Hapus!",
    cancelButtonText: options.cancelButtonText || "Batal",
    reverseButtons: true,
    customClass: deleteCustomClass,
    buttonsStyling: false,
  });

  return result.isConfirmed;
};

/**
 * Show generic confirmation alert
 */
export const showConfirm = async (
  title: string,
  text?: string,
  confirmText: string = "Ya",
  cancelText: string = "Batal"
): Promise<boolean> => {
  const result = await Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    customClass: defaultCustomClass,
    buttonsStyling: false,
  });

  return result.isConfirmed;
};

/**
 * Show save confirmation alert
 */
export const showSaveConfirm = async (
  title: string = "Simpan Perubahan?",
  text: string = "Apakah Anda yakin ingin menyimpan perubahan ini?"
): Promise<boolean> => {
  const result = await Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya, Simpan",
    cancelButtonText: "Batal",
    reverseButtons: true,
    customClass: successCustomClass,
    buttonsStyling: false,
  });

  return result.isConfirmed;
};

/**
 * Show logout confirmation alert
 */
export const showLogoutConfirm = async (): Promise<boolean> => {
  const result = await Swal.fire({
    icon: "question",
    title: "Keluar dari Aplikasi?",
    text: "Anda akan keluar dari sesi saat ini.",
    showCancelButton: true,
    confirmButtonText: "Ya, Keluar",
    cancelButtonText: "Batal",
    reverseButtons: true,
    customClass: warningCustomClass,
    buttonsStyling: false,
  });

  return result.isConfirmed;
};

/**
 * Show discard changes confirmation
 */
export const showDiscardConfirm = async (): Promise<boolean> => {
  const result = await Swal.fire({
    icon: "warning",
    title: "Buang Perubahan?",
    text: "Semua perubahan yang belum disimpan akan hilang.",
    showCancelButton: true,
    confirmButtonText: "Ya, Buang",
    cancelButtonText: "Kembali",
    reverseButtons: true,
    customClass: warningCustomClass,
    buttonsStyling: false,
  });

  return result.isConfirmed;
};

// ============================================
// Input Alerts
// ============================================

/**
 * Show text input alert
 */
export const showInputText = async (
  options: InputAlertOptions = {}
): Promise<string | null> => {
  const result = await Swal.fire({
    icon: "question",
    title: options.title || "Masukkan Data",
    text: options.text,
    input: "text",
    inputPlaceholder: options.inputPlaceholder || "Ketik di sini...",
    inputValue: options.inputValue || "",
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || "Simpan",
    cancelButtonText: options.cancelButtonText || "Batal",
    reverseButtons: true,
    customClass: defaultCustomClass,
    buttonsStyling: false,
    inputValidator: (value: any) => {
      if (options.inputValidator) {
        return options.inputValidator(value);
      }
      if (!value) {
        return "Field ini tidak boleh kosong!";
      }
      return null;
    },
  });

  return result.isConfirmed ? result.value : null;
};

/**
 * Show textarea input alert
 */
export const showInputTextarea = async (
  options: InputAlertOptions = {}
): Promise<string | null> => {
  const result = await Swal.fire({
    icon: "question",
    title: options.title || "Masukkan Data",
    text: options.text,
    input: "textarea",
    inputPlaceholder: options.inputPlaceholder || "Ketik di sini...",
    inputValue: options.inputValue || "",
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || "Simpan",
    cancelButtonText: options.cancelButtonText || "Batal",
    reverseButtons: true,
    customClass: defaultCustomClass,
    buttonsStyling: false,
  });

  return result.isConfirmed ? result.value : null;
};

/**
 * Show email input alert
 */
export const showInputEmail = async (
  title: string = "Masukkan Email",
  placeholder: string = "email@example.com"
): Promise<string | null> => {
  const result = await Swal.fire({
    icon: "question",
    title,
    input: "email",
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: "Kirim",
    cancelButtonText: "Batal",
    reverseButtons: true,
    customClass: defaultCustomClass,
    buttonsStyling: false,
    inputValidator: (value: any) => {
      if (!value) {
        return "Email tidak boleh kosong!";
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Format email tidak valid!";
      }
      return null;
    },
  });

  return result.isConfirmed ? result.value : null;
};

/**
 * Show select input alert
 */
export const showInputSelect = async (
  title: string,
  options: Record<string, string>,
  placeholder: string = "Pilih opsi..."
): Promise<string | null> => {
  const result = await Swal.fire({
    icon: "question",
    title,
    input: "select",
    inputOptions: options,
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: "Pilih",
    cancelButtonText: "Batal",
    reverseButtons: true,
    customClass: defaultCustomClass,
    buttonsStyling: false,
    inputValidator: (value: any) => {
      if (!value) {
        return "Pilih salah satu opsi!";
      }
      return null;
    },
  });

  return result.isConfirmed ? result.value : null;
};

// ============================================
// Loading & Progress Alerts
// ============================================

/**
 * Show loading alert
 */
export const showLoading = (
  title: string = "Memproses...",
  text?: string
): void => {
  Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    customClass: defaultCustomClass,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

/**
 * Close loading alert
 */
export const closeLoading = (): void => {
  Swal.close();
};

/**
 * Show loading with promise
 */
export const showLoadingAsync = async <T>(
  promise: Promise<T>,
  loadingTitle: string = "Memproses...",
  successTitle: string = "Berhasil!",
  errorTitle: string = "Error!"
): Promise<T | null> => {
  try {
    showLoading(loadingTitle);
    const result = await promise;
    Swal.close();
    await showSuccess(successTitle);
    return result;
  } catch (error: any) {
    Swal.close();
    await showError(errorTitle, error?.message || "Terjadi kesalahan");
    return null;
  }
};

// ============================================
// Toast Notifications
// ============================================

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: "!bg-slate-800 !rounded-xl !border !border-slate-700",
    title: "!text-white !text-sm",
  },
  didOpen: (toast: any) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

/**
 * Show success toast
 */
export const toastSuccess = (message: string): void => {
  Toast.fire({
    icon: "success",
    title: message,
  });
};

/**
 * Show error toast
 */
export const toastError = (message: string): void => {
  Toast.fire({
    icon: "error",
    title: message,
  });
};

/**
 * Show warning toast
 */
export const toastWarning = (message: string): void => {
  Toast.fire({
    icon: "warning",
    title: message,
  });
};

/**
 * Show info toast
 */
export const toastInfo = (message: string): void => {
  Toast.fire({
    icon: "info",
    title: message,
  });
};

export const showErrorMessages = (
  title: string = "Error!",
  messages?: string | string[]
): Promise<SweetAlertResult> => {
  let errorText = "";

  if (Array.isArray(messages)) {
    // Jika message adalah array, gabungkan dengan bullet points
    errorText = messages.map((msg) => `• ${msg}`).join("\n");
  } else if (typeof messages === "string") {
    errorText = messages;
  } else {
    errorText = "Terjadi kesalahan. Silakan coba lagi.";
  }

  return Swal.fire({
    icon: "error",
    title,
    html: errorText.replace(/\n/g, "<br>"),
    confirmButtonText: "OK",
    customClass: deleteCustomClass,
    buttonsStyling: false,
  });
};
// ============================================
// Export Default Object
// ============================================

const Alert = {
  // Basic alerts
  show: showAlert,
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  errorMessages: showErrorMessages, // TAMBAHKAN INI

  // Confirmations
  confirm: showConfirm,
  confirmDelete: showDeleteConfirm,
  confirmSave: showSaveConfirm,
  confirmLogout: showLogoutConfirm,
  confirmDiscard: showDiscardConfirm,

  // Inputs
  inputText: showInputText,
  inputTextarea: showInputTextarea,
  inputEmail: showInputEmail,
  inputSelect: showInputSelect,

  // Loading
  loading: showLoading,
  closeLoading: closeLoading,
  loadingAsync: showLoadingAsync,

  // Toast
  toast: {
    success: toastSuccess,
    error: toastError,
    warning: toastWarning,
    info: toastInfo,
  },
};

export default Alert;
