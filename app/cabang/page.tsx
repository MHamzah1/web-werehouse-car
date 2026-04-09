import type { Metadata } from "next";
import LandingLayout from "@/components/view/Landing/LandingLayout";
import ShowroomSection from "@/components/view/Landing/ShowroomSection";

export const metadata: Metadata = {
  title: "Cabang Showroom - K-CUNK MOTOR Tulungagung",
  description:
    "3 cabang showroom K-CUNK MOTOR di Tulungagung siap melayani Anda. Temukan lokasi terdekat dan hubungi kami.",
};

export default function CabangPage() {
  return (
    <LandingLayout>
      <ShowroomSection />
    </LandingLayout>
  );
}
