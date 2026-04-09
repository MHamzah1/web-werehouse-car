import type { Metadata } from "next";
import LandingPage from "@/components/view/Landing/LandingPage";

export const metadata: Metadata = {
  title: "K-CUNK MOTOR - Jual Beli Mobil Bekas Berkualitas Tulungagung",
  description:
    "Showroom mobil bekas terpercaya di Tulungagung, Jawa Timur. Mobil berkualitas, harga realistis, proses transparan. 3 cabang showroom siap melayani Anda.",
  keywords: [
    "mobil bekas tulungagung",
    "showroom mobil tulungagung",
    "jual beli mobil bekas",
    "K-CUNK MOTOR",
    "mobil bekas berkualitas",
    "dealer mobil tulungagung",
    "mobil second tulungagung",
    "jawa timur",
  ],
  openGraph: {
    title: "K-CUNK MOTOR - Jual Beli Mobil Bekas Berkualitas",
    description:
      "Showroom mobil bekas terpercaya di Tulungagung. Mobil berkualitas, harga realistis, proses transparan.",
    type: "website",
    locale: "id_ID",
  },
};

export default function Home() {
  return <LandingPage />;
}
