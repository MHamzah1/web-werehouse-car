"use client";

import React from "react";
import { useRoleBasedGuard, UserRole } from "@/hooks/useRoleBasedGuard";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
}) => {
  const { isChecking, isAllowed, loading, userRole } = useRoleBasedGuard();

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return null;
  }

  if (allowedRoles && userRole) {
    if (!allowedRoles.includes(userRole)) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Akses Ditolak
            </h2>
            <p className="text-gray-600">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Role Anda:{" "}
              <span className="font-semibold capitalize">{userRole}</span>
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export const RoleGuardWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <RoleGuard>{children}</RoleGuard>;
};

export default RoleGuard;
