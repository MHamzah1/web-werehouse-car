"use client";

import React from "react";
import { useRouteGuard } from "@/hooks/useRouteGuard";

export const RouteGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isChecking, isAllowed, loading } = useRouteGuard();

  // Loading screen
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAllowed) return null;

  return <>{children}</>;
};
