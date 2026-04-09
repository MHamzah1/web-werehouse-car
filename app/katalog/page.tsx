import type { Metadata } from "next";
import LandingLayout from "@/components/view/Landing/LandingLayout";
import CatalogSection from "@/components/view/Landing/CatalogSection";

export const metadata: Metadata = {
  title: "Katalog Mobil Bekas - K-CUNK MOTOR Tulungagung",
  description:
    "Lihat koleksi mobil bekas berkualitas siap jual di K-CUNK MOTOR. Semua kendaraan telah lolos inspeksi 50+ titik pengecekan.",
};

export default function KatalogPage() {
  return (
    <LandingLayout>
      <CatalogSection isFullPage />
    </LandingLayout>
  );
}
