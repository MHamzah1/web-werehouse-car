"use client";

import { useSearchParams } from "next/navigation";
import { decryptQueryParam } from "@/lib/slug/slug";
import InspectionDetailView from "@/components/view/Warehouse/inspection/InspectionDetailView";

export default function Page() {
  const searchParams = useSearchParams();
  const inspectionId = decryptQueryParam(searchParams.get("id"));

  if (!inspectionId) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Inspeksi tidak ditemukan
      </div>
    );
  }

  return <InspectionDetailView inspectionId={inspectionId} />;
}
