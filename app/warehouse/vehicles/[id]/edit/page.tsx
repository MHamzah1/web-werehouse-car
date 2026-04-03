import VehicleEditForm from "@/components/view/Warehouse/VehicleEditForm";
import { decryptSlug } from "@/lib/slug/slug";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: encryptedId } = await params;
  const id = decryptSlug(encryptedId);

  return <VehicleEditForm id={id} />;
}
