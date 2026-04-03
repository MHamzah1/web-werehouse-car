"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { useTheme } from "@/context/ThemeContext";
import {
  FiHome,
  FiGrid,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
  FiBarChart2,
} from "react-icons/fi";
import { BsBarChartFill } from "react-icons/bs";
import { HiOutlineTag, HiOutlineCog } from "react-icons/hi";
import { IoCarSportOutline } from "react-icons/io5";

interface SubMenuItem {
  label: string;
  href: string;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  subItems?: SubMenuItem[];
}

interface UserData {
  fullName: string;
  email: string;
  role: string;
  userId: string;
}

const MasterDataLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Master Data"]);
  const [userData, setUserData] = useState<UserData>({
    fullName: "Guest User",
    email: "guest@example.com",
    role: "guest",
    userId: "",
  });

  useEffect(() => {
    const fullName = Cookies.get("fullName") || "Guest User";
    const email = Cookies.get("email") || "guest@example.com";
    const role = Cookies.get("role") || "guest";
    const userId = Cookies.get("userId") || "";
    setUserData({
      fullName: decodeURIComponent(fullName),
      email: decodeURIComponent(email),
      role: decodeURIComponent(role),
      userId: decodeURIComponent(userId),
    });
  }, []);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    [
      "accessToken", "refreshToken", "fullName", "email", "role",
      "userId", "phoneNumber", "whatsappNumber", "location",
      "createdAt", "updatedAt", "rolePositionName", "roleUserName",
    ].forEach((k) => Cookies.remove(k));
    window.location.href = "/auth/login";
  };

  const isMenuActive = (href?: string, subItems?: SubMenuItem[]): boolean => {
    if (href && pathname === href) return true;
    if (subItems) {
      return subItems.some((sub) => pathname?.startsWith(sub.href.replace("/Table", "").replace("/Add", "")));
    }
    return false;
  };

  const isSubMenuActive = (href: string): boolean => {
    const basePath = href.replace("/Table", "").replace("/Add", "");
    return pathname?.startsWith(basePath) || false;
  };

  const menuItems: MenuItem[] = [
    {
      icon: FiHome,
      label: "Warehouse",
      href: "/warehouse/dashboard",
    },
    {
      icon: FiGrid,
      label: "Master Data",
      subItems: [
        { label: "Brand", href: "/master-data/brand" },
        { label: "Car Model", href: "/master-data/car-model" },
        { label: "Variant", href: "/master-data/variant" },
        { label: "Year Price", href: "/master-data/year-price" },
      ],
    },
  ];

  const getSubMenuIcon = (label: string) => {
    switch (label) {
      case "Brand": return HiOutlineTag;
      case "Car Model": return IoCarSportOutline;
      case "Variant": return IoCarSportOutline;
      case "Year Price": return FiBarChart2;
      default: return FiGrid;
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white" : "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900"}`}>
      <aside className={`fixed top-0 left-0 h-full backdrop-blur-xl border-r transition-all duration-300 z-40 ${sidebarOpen ? "w-64" : "w-20"} ${isDarkMode ? "bg-slate-900/80 border-slate-800/50" : "bg-white/80 border-slate-200"}`}>
        <div className={`h-20 flex items-center justify-between px-6 border-b ${isDarkMode ? "border-slate-800/50" : "border-slate-200"}`}>
          <Link href="/warehouse/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <BsBarChartFill className="text-white text-xl" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className={`text-lg font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  Warehouse
                </h1>
                <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Master Data
                </p>
              </div>
            )}
          </Link>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
          {menuItems.map((item, index) => {
            const isActive = isMenuActive(item.href, item.subItems);
            const isExpanded = expandedMenus.includes(item.label);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={index}>
                {hasSubItems ? (
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive ? `bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border ${isDarkMode ? "border-emerald-500/30" : "border-emerald-500/50"}` : isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800/50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
                  >
                    <item.icon className="text-xl relative z-10 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="font-semibold relative z-10 flex-1 text-left">{item.label}</span>
                        <span className="relative z-10">
                          {isExpanded ? <FiChevronDown className="text-lg" /> : <FiChevronRight className="text-lg" />}
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive ? `bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border ${isDarkMode ? "border-emerald-500/30" : "border-emerald-500/50"}` : isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800/50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
                  >
                    <item.icon className="text-xl relative z-10" />
                    {sidebarOpen && <span className="font-semibold relative z-10">{item.label}</span>}
                  </Link>
                )}

                {hasSubItems && sidebarOpen && isExpanded && (
                  <div className="mt-2 ml-4 pl-4 border-l border-slate-700/50 space-y-1">
                    {item.subItems?.map((subItem, subIndex) => {
                      const SubIcon = getSubMenuIcon(subItem.label);
                      const isSubActive = isSubMenuActive(subItem.href);
                      return (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isSubActive ? isDarkMode ? "bg-emerald-500/20 text-emerald-400 font-semibold" : "bg-emerald-100 text-emerald-700 font-semibold" : isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800/30" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
                        >
                          <SubIcon className={`text-lg ${isSubActive ? "text-emerald-400" : ""}`} />
                          <span className="text-sm">{subItem.label}</span>
                          {isSubActive && <div className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDarkMode ? "border-slate-800/50" : "border-slate-200"}`}>
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isDarkMode ? "bg-slate-800/50" : "bg-slate-100"}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                  {getInitials(userData.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>{userData.fullName}</p>
                  <p className={`text-xs truncate ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{userData.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${isDarkMode ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30" : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"}`}
              >
                <FiLogOut className="text-lg" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                {getInitials(userData.fullName)}
              </div>
              <button onClick={handleLogout} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg" title="Logout">
                <FiLogOut className="text-lg" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <header className={`h-20 border-b backdrop-blur-xl sticky top-0 z-30 ${isDarkMode ? "border-slate-800/50 bg-slate-900/30" : "border-slate-200 bg-white/30"}`}>
          <div className="h-full px-8 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? "bg-slate-800/50 hover:bg-slate-800" : "bg-slate-100 hover:bg-slate-200"}`}
            >
              {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all duration-300 ${isDarkMode ? "bg-slate-800/50 hover:bg-slate-800 text-yellow-400" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
              >
                {isDarkMode ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
              </button>
            </div>
          </div>
        </header>
        <main className="p-8 relative z-10">{children}</main>
      </div>
    </div>
  );
};

export default MasterDataLayout;
