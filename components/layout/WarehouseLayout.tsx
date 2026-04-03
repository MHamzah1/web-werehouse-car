/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/lib/state/store";
import {
  fetchShowrooms,
  setSelectedShowroom,
  Showroom,
} from "@/lib/state/slice/warehouse/warehouseSlice";
import { useTheme } from "@/context/ThemeContext";
import {
  FiHome,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiChevronDown,
  FiLogOut,
  FiTruck,
  FiClipboard,
  FiMapPin,
  FiTool,
  FiShoppingBag,
  FiActivity,
  FiGrid,
  FiSearch,
  FiMap,
  FiSend,
} from "react-icons/fi";
import { BsBuilding, BsBarChartFill } from "react-icons/bs";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: string[];
}

const WarehouseLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showroomDropdownOpen, setShowroomDropdownOpen] = useState(false);

  // Use ThemeContext so dark class on <html> stays in sync
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const { showrooms, selectedShowroom } = useSelector(
    (state: RootState) => state.warehouse,
  );
  const { userInfo } = useSelector((state: RootState) => state.auth);

  // Detect mobile/tablet vs desktop
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      setSidebarOpen(!e.matches);
    };
    handler(mql);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Auto-close sidebar on navigation (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  useEffect(() => {
    dispatch(fetchShowrooms());
  }, [dispatch]);

  useEffect(() => {
    if (showrooms.length > 0 && !selectedShowroom) {
      dispatch(setSelectedShowroom(showrooms[0]));
    }
  }, [showrooms, selectedShowroom, dispatch]);

  const handleLogout = () => {
    [
      "accessToken",
      "refreshToken",
      "fullName",
      "email",
      "role",
      "userId",
      "phoneNumber",
      "whatsappNumber",
      "location",
      "createdAt",
      "updatedAt",
    ].forEach((k) => Cookies.remove(k));
    window.location.href = "/auth/login";
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // Resolve user role: prioritas rolePosition.roleUser.name, fallback ke legacy role
  const userRole =
    userInfo?.rolePosition?.roleUser?.name ?? userInfo?.role ?? "";

  const menuItems: MenuItem[] = [
    {
      icon: FiHome,
      label: "Dashboard",
      href: "/warehouse/dashboard",
      roles: [
        "showroom_owner",
        "warehouse_admin",
        "inspector",
        "mechanic",
      ],
    },
    {
      icon: BsBuilding,
      label: "Showroom",
      href: "/warehouse/showrooms",
      roles: ["warehouse_admin", "showroom_owner"],
    },
    {
      icon: FiGrid,
      label: "Showroom View",
      href: "/warehouse/showroom-view",
      roles: ["warehouse_admin", "showroom_owner"],
    },
    {
      icon: FiMap,
      label: "Showroom Map",
      href: "/warehouse/showroom-map",
      roles: ["warehouse_admin", "showroom_owner"],
    },
    {
      icon: FiTruck,
      label: "Kendaraan",
      href: "/warehouse/vehicles",
      roles: [
        "warehouse_admin",
        "showroom_owner",
        "inspector",
      ],
    },
    {
      icon: FiClipboard,
      label: "Inspeksi",
      href: "/warehouse/inspections",
      roles: [
        "inspector",
        "showroom_owner",
      ],
    },
    {
      icon: FiMapPin,
      label: "Zona Gudang",
      href: "/warehouse/zones",
      roles: ["warehouse_admin", "showroom_owner"],
    },
    {
      icon: FiTool,
      label: "Perbaikan",
      href: "/warehouse/repairs",
      roles: ["showroom_owner", "mechanic"],
    },
    {
      icon: FiSend,
      label: "Pencairan Dana",
      href: "/warehouse/disbursements",
      roles: ["warehouse_admin", "showroom_owner"],
    },
    {
      icon: FiShoppingBag,
      label: "Transaksi",
      href: "/warehouse/purchases",
      roles: ["warehouse_admin", "showroom_owner"],
    },
    {
      icon: FiActivity,
      label: "Stok Log",
      href: "/warehouse/stock-logs",
      roles: ["warehouse_admin", "showroom_owner"],
    },
  ];

  // Filter menu berdasarkan role user
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole),
  );

  const isActive = (href: string) => pathname?.startsWith(href) || false;

  return (
    <div
      className={`min-h-dvh flex ${isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}
    >
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-dvh z-40 transition-all duration-300 flex flex-col border-r ${
          isMobile
            ? `w-72 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
            : sidebarOpen
              ? "w-64"
              : "w-20"
        } ${isDarkMode ? "bg-slate-900/95 border-slate-800/50" : "bg-white border-slate-200"}`}
      >
        {/* Logo */}
        <div
          className={`h-20 flex items-center px-4 border-b ${isDarkMode ? "border-slate-800/50" : "border-slate-200"}`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <BsBarChartFill className="text-white text-xl" />
          </div>
          {(sidebarOpen || isMobile) && (
            <div className="ml-3">
              <span className="text-lg font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                Warehouse
              </span>
              <p
                className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Management System
              </p>
            </div>
          )}
        </div>

        {/* Showroom Selector */}
        {(sidebarOpen || isMobile) && (
          <div className={`mx-3 mt-4 mb-2 relative`}>
            <button
              onClick={() => setShowroomDropdownOpen(!showroomDropdownOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isDarkMode
                  ? "bg-slate-800/60 hover:bg-slate-800 text-slate-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <span className="truncate">
                {selectedShowroom?.name || "Pilih Showroom"}
              </span>
              <FiChevronDown
                className={`transition-transform ${showroomDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {showroomDropdownOpen && showrooms.length > 0 && (
              <div
                className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl z-50 overflow-hidden border ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                {showrooms.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      dispatch(setSelectedShowroom(s));
                      setShowroomDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                      selectedShowroom?.id === s.id
                        ? isDarkMode
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-emerald-50 text-emerald-700"
                        : isDarkMode
                          ? "hover:bg-slate-700 text-slate-300"
                          : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="font-medium">{s.name}</div>
                    <div
                      className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                    >
                      {s.code}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden ${
                  active
                    ? `bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border ${
                        isDarkMode
                          ? "border-emerald-500/30"
                          : "border-emerald-500/50"
                      }`
                    : isDarkMode
                      ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <item.icon className="text-xl flex-shrink-0" />
                {(sidebarOpen || isMobile) && (
                  <span className="font-semibold text-sm">{item.label}</span>
                )}
                {!sidebarOpen && !isMobile && active && (
                  <div className="absolute right-2 w-2 h-2 bg-emerald-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Bottom */}
        <div
          className={`p-4 border-t ${isDarkMode ? "border-slate-800/50" : "border-slate-200"}`}
        >
          {sidebarOpen || isMobile ? (
            <div className="space-y-3">
              <div
                className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? "bg-slate-800/50" : "bg-slate-100"}`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                  {getInitials(userInfo?.fullName || "U")}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {userInfo?.fullName || "User"}
                  </p>
                  <p
                    className={`text-xs truncate ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {userInfo?.rolePosition?.name || userInfo?.role || ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/"
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isDarkMode
                      ? "bg-slate-800/50 hover:bg-slate-800 text-slate-300"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <FiHome className="text-base" /> Beranda
                </Link>
                <button
                  onClick={handleLogout}
                  className={`px-3 py-2 rounded-xl transition-colors ${
                    isDarkMode
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
                  title="Logout"
                >
                  <FiLogOut className="text-lg" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                {getInitials(userInfo?.fullName || "U")}
              </div>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg"
                title="Logout"
              >
                <FiLogOut />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 flex-1 min-w-0 overflow-x-hidden ${
          isMobile ? "ml-0" : sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <header
          className={`h-14 sm:h-16 border-b sticky top-0 z-20 backdrop-blur-xl ${
            isDarkMode
              ? "border-slate-800/50 bg-slate-950/80"
              : "border-slate-200 bg-white/80"
          }`}
        >
          <div className="h-full px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isDarkMode
                    ? "bg-slate-800/50 hover:bg-slate-800"
                    : "bg-slate-100 hover:bg-slate-200"
                }`}
              >
                {sidebarOpen && !isMobile ? (
                  <FiX className="text-xl" />
                ) : (
                  <FiMenu className="text-xl" />
                )}
              </button>
              {/* Show selected showroom name on mobile header */}
              {isMobile && selectedShowroom && (
                <span
                  className={`text-sm font-medium truncate max-w-[150px] sm:max-w-[200px] ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {selectedShowroom.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-colors ${
                  isDarkMode
                    ? "bg-slate-800/50 hover:bg-slate-800 text-yellow-400"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {isDarkMode ? (
                  <FiSun className="text-xl" />
                ) : (
                  <FiMoon className="text-xl" />
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 relative z-10">{children}</main>
      </div>
    </div>
  );
};

export default WarehouseLayout;
