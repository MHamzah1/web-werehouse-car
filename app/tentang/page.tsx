import type { Metadata } from "next";
import LandingLayout from "@/components/view/Landing/LandingLayout";
import AboutSection from "@/components/view/Landing/AboutSection";
import WhyUsSection from "@/components/view/Landing/WhyUsSection";

export const metadata: Metadata = {
  title: "Tentang Kami - K-CUNK MOTOR Tulungagung",
  description:
    "Kenali K-CUNK MOTOR lebih dekat. Showroom mobil bekas terpercaya di Tulungagung sejak 2007 dengan komitmen kualitas dan kejujuran.",
};

export default function TentangPage() {
  return (
    <LandingLayout>
      <AboutSection />
      <WhyUsSection />
    </LandingLayout>
  );
}
