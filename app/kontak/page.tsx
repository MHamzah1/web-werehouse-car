import type { Metadata } from "next";
import LandingLayout from "@/components/view/Landing/LandingLayout";
import ContactSection from "@/components/view/Landing/ContactSection";

export const metadata: Metadata = {
  title: "Kontak - K-CUNK MOTOR Tulungagung",
  description:
    "Hubungi K-CUNK MOTOR untuk konsultasi gratis. Chat via WhatsApp atau kunjungi showroom kami di Tulungagung.",
};

export default function KontakPage() {
  return (
    <LandingLayout>
      <ContactSection />
    </LandingLayout>
  );
}
