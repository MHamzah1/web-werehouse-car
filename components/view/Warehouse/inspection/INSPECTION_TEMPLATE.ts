export interface InspectionTemplateItem {
  code: string;
  name: string;
  description?: string;
}

export interface InspectionTemplateCategory {
  category: string;
  label: string;
  icon: string;
  items: InspectionTemplateItem[];
}

export const INSPECTION_CATEGORIES: InspectionTemplateCategory[] = [
  {
    category: "exterior",
    label: "Eksterior",
    icon: "🚗",
    items: [
      { code: "EXT-01", name: "Cat Body", description: "Kondisi cat keseluruhan" },
      { code: "EXT-02", name: "Panel Body", description: "Penyok, retak, atau karat" },
      { code: "EXT-03", name: "Lampu Depan", description: "Kondisi headlight" },
      { code: "EXT-04", name: "Lampu Belakang", description: "Kondisi tail light" },
      { code: "EXT-05", name: "Kaca Depan", description: "Retak atau gores" },
      { code: "EXT-06", name: "Kaca Samping & Belakang", description: "Kondisi keseluruhan kaca" },
      { code: "EXT-07", name: "Ban & Velg", description: "Kedalaman alur ban, kondisi velg" },
      { code: "EXT-08", name: "Spion", description: "Kiri dan kanan" },
      { code: "EXT-09", name: "Bumper Depan & Belakang", description: "Penyok, retak, copot" },
      { code: "EXT-10", name: "Wiper", description: "Kondisi dan fungsi wiper" },
    ],
  },
  {
    category: "interior",
    label: "Interior",
    icon: "💺",
    items: [
      { code: "INT-01", name: "Jok / Kursi", description: "Kondisi jok depan dan belakang" },
      { code: "INT-02", name: "Dashboard", description: "Retak, pudar, atau rusak" },
      { code: "INT-03", name: "Plafon", description: "Kendor, noda, atau rusak" },
      { code: "INT-04", name: "Karpet", description: "Kondisi karpet dasar" },
      { code: "INT-05", name: "Setir", description: "Kondisi steering wheel" },
      { code: "INT-06", name: "AC", description: "Dingin, hembusan, bau" },
      { code: "INT-07", name: "Audio System", description: "Head unit, speaker" },
      { code: "INT-08", name: "Power Window", description: "Semua jendela berfungsi" },
      { code: "INT-09", name: "Central Lock", description: "Kunci sentral berfungsi" },
      { code: "INT-10", name: "Sabuk Pengaman", description: "Kondisi dan fungsi" },
    ],
  },
  {
    category: "engine",
    label: "Mesin",
    icon: "⚙️",
    items: [
      { code: "ENG-01", name: "Suara Mesin", description: "Idle dan akselerasi" },
      { code: "ENG-02", name: "Oli Mesin", description: "Level dan warna oli" },
      { code: "ENG-03", name: "Radiator & Coolant", description: "Level coolant, kebocoran" },
      { code: "ENG-04", name: "Aki / Baterai", description: "Kondisi dan tegangan" },
      { code: "ENG-05", name: "Belt & Hose", description: "Retak, aus, atau kendor" },
      { code: "ENG-06", name: "Filter Udara", description: "Bersih atau kotor" },
      { code: "ENG-07", name: "Transmisi", description: "Perpindahan gigi halus" },
      { code: "ENG-08", name: "Kopling (Manual)", description: "Kedalaman kopling, slip" },
    ],
  },
  {
    category: "electrical",
    label: "Kelistrikan",
    icon: "⚡",
    items: [
      { code: "ELC-01", name: "Lampu Indikator", description: "Dashboard warning lights" },
      { code: "ELC-02", name: "Klakson", description: "Bunyi normal" },
      { code: "ELC-03", name: "Sensor Parkir", description: "Berfungsi normal" },
      { code: "ELC-04", name: "Kamera Mundur", description: "Tampilan jelas" },
    ],
  },
  {
    category: "chassis",
    label: "Kaki-kaki & Chassis",
    icon: "🔧",
    items: [
      { code: "CHS-01", name: "Suspensi Depan", description: "Bunyi, bocor, ayunan" },
      { code: "CHS-02", name: "Suspensi Belakang", description: "Bunyi, bocor, ayunan" },
      { code: "CHS-03", name: "Rem Depan", description: "Pad, piringan, fungsi" },
      { code: "CHS-04", name: "Rem Belakang", description: "Pad, piringan/tromol, fungsi" },
      { code: "CHS-05", name: "Kaki-kaki", description: "Ball joint, tie rod, rack end" },
      { code: "CHS-06", name: "Rangka / Chassis", description: "Karat, perbaikan, tabrakan" },
    ],
  },
  {
    category: "test_drive",
    label: "Test Drive",
    icon: "🏎️",
    items: [
      { code: "TD-01", name: "Akselerasi", description: "Responsif, tarikan mesin" },
      { code: "TD-02", name: "Pengereman", description: "Pakem, tidak miring" },
      { code: "TD-03", name: "Kemudi", description: "Stabil, tidak banting" },
      { code: "TD-04", name: "Getaran / Noise", description: "Bunyi abnormal saat jalan" },
    ],
  },
  {
    category: "documents",
    label: "Dokumen",
    icon: "📄",
    items: [
      { code: "DOC-01", name: "BPKB", description: "Ada dan sesuai" },
      { code: "DOC-02", name: "STNK", description: "Ada, aktif, sesuai" },
      { code: "DOC-03", name: "Faktur", description: "Ada dan sesuai" },
      { code: "DOC-04", name: "KTP Pemilik", description: "Ada dan sesuai" },
      { code: "DOC-05", name: "Kunci Cadangan", description: "Ada" },
      { code: "DOC-06", name: "Nomor Rangka", description: "Cocok dengan dokumen" },
    ],
  },
];

export const CONDITION_OPTIONS = [
  { value: "good", label: "Baik", color: "text-green-600", bg: "bg-green-100" },
  { value: "fair", label: "Cukup", color: "text-yellow-600", bg: "bg-yellow-100" },
  { value: "poor", label: "Kurang", color: "text-orange-600", bg: "bg-orange-100" },
  { value: "damaged", label: "Rusak", color: "text-red-600", bg: "bg-red-100" },
  { value: "na", label: "N/A", color: "text-gray-500", bg: "bg-gray-100" },
] as const;

export type ItemConditionType = "good" | "fair" | "poor" | "damaged" | "na";
