"use client";

import { useSearchParams } from "next/navigation";
import { decryptQueryParam } from "@/lib/slug/slug";
import RepairDetailView from "@/components/view/Warehouse/repair/RepairDetailView";

export default function Page() {
  const searchParams = useSearchParams();
  const repairId = decryptQueryParam(searchParams.get("id"));

  if (!repairId) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Repair order tidak ditemukan
      </div>
    );
  }

  return <RepairDetailView repairId={repairId} />;
}
