"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/state/store";

const ROUTE_CONFIG = {
  protected: [
    "/warehouse",
    "/master-data",
    "/profile",
  ],
  guest: ["/auth/login", "/auth/register"],
  public: ["/", "/vehicles"],
};

export const useRouteGuard = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, loading } = useSelector((state: RootState) => state.auth);
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const isPublicRoute = ROUTE_CONFIG.public.some((route) =>
      pathname === route || pathname.startsWith(route + "/")
    );

    // Allow public routes immediately without waiting for auth
    if (isPublicRoute) {
      setIsAllowed(true);
      setIsChecking(false);
      return;
    }

    if (loading) return;

    const checkRouteAccess = () => {
      const isProtectedRoute = ROUTE_CONFIG.protected.some((route) =>
        pathname.startsWith(route)
      );

      const isGuestRoute = ROUTE_CONFIG.guest.some((route) =>
        pathname.startsWith(route)
      );

      if (isProtectedRoute) {
        if (!isLoggedIn) {
          const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
          router.push(loginUrl);
          setIsAllowed(false);
        } else {
          setIsAllowed(true);
        }
      } else if (isGuestRoute) {
        if (isLoggedIn) {
          router.push("/warehouse/dashboard");
          setIsAllowed(false);
        } else {
          setIsAllowed(true);
        }
      } else {
        setIsAllowed(true);
      }

      setIsChecking(false);
    };

    checkRouteAccess();
  }, [pathname, isLoggedIn, loading, router]);

  return { isChecking, isAllowed, isLoggedIn, loading };
};
