"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/state/store";

export type UserRole = string;

const ROLE_BASED_ROUTES = {
  // Warehouse routes (showroom_owner, warehouse_admin, inspector, mechanic)
  warehouse: ["/warehouse"],

  // Granular warehouse sub-route access per role
  warehouseSubRoutes: {
    "/warehouse/dashboard": [
      "showroom_owner",
      "warehouse_admin",
      "inspector",
      "mechanic",
    ],
    "/warehouse/showrooms": ["showroom_owner", "warehouse_admin"],
    "/warehouse/showroom-view": ["showroom_owner", "warehouse_admin"],
    "/warehouse/showroom-map": ["showroom_owner", "warehouse_admin"],
    "/warehouse/vehicles": [
      "showroom_owner",
      "warehouse_admin",
      "inspector",
    ],
    "/warehouse/inspections": [
      "inspector",
      "showroom_owner",
    ],
    "/warehouse/zones": ["warehouse_admin", "showroom_owner"],
    "/warehouse/repairs": [
      "showroom_owner",
      "mechanic",
    ],
    "/warehouse/disbursements": ["showroom_owner", "warehouse_admin"],
    "/warehouse/purchases": ["showroom_owner", "warehouse_admin"],
    "/warehouse/stock-logs": ["showroom_owner", "warehouse_admin"],
  } as Record<string, string[]>,

  // Master data - accessible by admin_mediator and showroom_owner
  masterData: ["/master-data"],

  // Routes yang memerlukan login (any role)
  authenticated: [
    "/profile",
  ],

  // Guest only routes (belum login)
  guest: ["/auth/login", "/auth/register"],

  // Public routes (siapa saja bisa akses)
  public: ["/"],
};

interface RouteGuardResult {
  isChecking: boolean;
  isAllowed: boolean;
  isLoggedIn: boolean;
  userInfo: any;
  loading: boolean;
  userRole: UserRole | null;
}

export const useRoleBasedGuard = (): RouteGuardResult => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, userInfo, loading } = useSelector(
    (state: RootState) => state.auth,
  );
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  const userRole: UserRole | null =
    (userInfo?.rolePosition?.roleUser?.name ?? userInfo?.role) || null;

  const redirectToRoleBasedDashboard = () => {
    router.push("/warehouse/dashboard");
  };

  useEffect(() => {
    if (loading) return;

    const checkAccess = () => {
      // Check master data routes
      const isMasterDataRoute = ROLE_BASED_ROUTES.masterData.some((route: string) =>
        pathname.startsWith(route),
      );

      if (isMasterDataRoute) {
        if (!isLoggedIn) {
          router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
          setIsAllowed(false);
        } else if (!["admin_mediator", "showroom_owner", "warehouse_admin"].includes(userRole || "")) {
          redirectToRoleBasedDashboard();
          setIsAllowed(false);
        } else {
          setIsAllowed(true);
        }
        setIsChecking(false);
        return;
      }

      // Check warehouse routes
      const isWarehouseRoute = ROLE_BASED_ROUTES.warehouse.some((route) =>
        pathname.startsWith(route),
      );

      if (isWarehouseRoute) {
        if (!isLoggedIn) {
          router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
          setIsAllowed(false);
        } else if (
          ![
            "showroom_owner",
            "warehouse_admin",
            "inspector",
            "mechanic",
            "admin_mediator",
          ].includes(userRole || "")
        ) {
          router.push("/auth/login");
          setIsAllowed(false);
        } else {
          // Granular sub-route check
          const subRoutes = ROLE_BASED_ROUTES.warehouseSubRoutes;
          const matchedRoute = Object.keys(subRoutes)
            .sort((a, b) => b.length - a.length)
            .find((route) => pathname.startsWith(route));

          if (
            matchedRoute &&
            userRole !== "admin_mediator" &&
            !subRoutes[matchedRoute].includes(userRole || "")
          ) {
            router.push("/warehouse/dashboard");
            setIsAllowed(false);
          } else {
            setIsAllowed(true);
          }
        }
        setIsChecking(false);
        return;
      }

      // Check authenticated routes (any logged in user)
      const isAuthRoute = ROLE_BASED_ROUTES.authenticated.some((route) =>
        pathname.startsWith(route),
      );

      if (isAuthRoute) {
        if (!isLoggedIn) {
          router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
          setIsAllowed(false);
        } else {
          setIsAllowed(true);
        }
        setIsChecking(false);
        return;
      }

      // Check guest only routes
      const isGuestRoute = ROLE_BASED_ROUTES.guest.some((route) =>
        pathname.startsWith(route),
      );

      if (isGuestRoute) {
        if (isLoggedIn) {
          redirectToRoleBasedDashboard();
          setIsAllowed(false);
        } else {
          setIsAllowed(true);
        }
        setIsChecking(false);
        return;
      }

      // Public routes or unknown routes
      setIsAllowed(true);
      setIsChecking(false);
    };

    checkAccess();
  }, [pathname, isLoggedIn, userRole, loading, router]);

  return {
    isChecking,
    isAllowed,
    isLoggedIn,
    userInfo,
    loading,
    userRole,
  };
};

export const hasRoleAccess = (
  userRole: UserRole | null,
  pathname: string,
): boolean => {
  if (!userRole) return false;

  // admin_mediator = super admin
  if (userRole === "admin_mediator") return true;

  // Check warehouse sub-routes
  if (ROLE_BASED_ROUTES.warehouse.some((route) => pathname.startsWith(route))) {
    const subRoutes = ROLE_BASED_ROUTES.warehouseSubRoutes;
    const matchedRoute = Object.keys(subRoutes)
      .sort((a, b) => b.length - a.length)
      .find((route) => pathname.startsWith(route));

    if (matchedRoute) {
      return subRoutes[matchedRoute].includes(userRole);
    }
    return [
      "showroom_owner",
      "warehouse_admin",
      "inspector",
      "mechanic",
    ].includes(userRole);
  }

  // Master data routes
  if (ROLE_BASED_ROUTES.masterData.some((route) => pathname.startsWith(route))) {
    return ["admin_mediator", "showroom_owner", "warehouse_admin"].includes(userRole);
  }

  // Authenticated routes
  if (ROLE_BASED_ROUTES.authenticated.some((route) => pathname.startsWith(route))) {
    return true;
  }

  return true;
};

export const getRoleDashboard = (): string => {
  return "/warehouse/dashboard";
};

export { ROLE_BASED_ROUTES };
