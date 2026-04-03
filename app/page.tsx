"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/state/store";

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn) {
        router.replace("/warehouse/dashboard");
      } else {
        router.replace("/auth/login");
      }
    }
  }, [isLoggedIn, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Memuat...</p>
      </div>
    </div>
  );
}
