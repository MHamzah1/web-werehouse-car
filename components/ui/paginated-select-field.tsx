"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import instanceAxios from "@/lib/axiosInstance/instanceAxios";
import { FiChevronDown, FiSearch } from "react-icons/fi";

export interface PaginatedSelectFieldProps {
  label: string;
  /** Currently selected value (id) */
  value: string;
  /** Text to display in the trigger button; falls back to value if not provided */
  displayValue?: string;
  onChange: (value: string, item: unknown) => void;
  /** API path relative to the axios baseURL, e.g. "/brand/paged" */
  apiUrl: string;
  /** Extra query params merged on every request (e.g. { brandId: "..." }) */
  queryParams?: Record<string, string | number | boolean | undefined | null>;
  /** Extract the label from each item */
  getLabel: (item: unknown) => string;
  /** Extract the value (id) from each item */
  getValue: (item: unknown) => string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** Key used for the search query param (default: "search") */
  searchParamKey?: string;
}

const PaginatedSelectField: React.FC<PaginatedSelectFieldProps> = ({
  label,
  value,
  displayValue,
  onChange,
  apiUrl,
  queryParams = {},
  getLabel,
  getValue,
  placeholder = "Pilih...",
  disabled = false,
  required = false,
  searchParamKey = "search",
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Refs so scroll/fetch callbacks always see the latest values
  const pageRef = useRef(1);
  const totalPagesRef = useRef(1);
  const loadingMoreRef = useRef(false);
  const searchRef = useRef("");

  // Stable string representation for change detection
  const queryParamsStr = JSON.stringify(queryParams);

  const fetchData = useCallback(
    async (searchVal: string, pg: number, append: boolean) => {
      if (pg === 1 && !append) setLoading(true);
      else {
        setLoadingMore(true);
        loadingMoreRef.current = true;
      }

      try {
        const params: Record<string, unknown> = {
          page: pg,
          perPage: 10,
          ...JSON.parse(queryParamsStr),
        };
        if (searchVal) params[searchParamKey] = searchVal;

        const res = await instanceAxios.get(apiUrl, { params });
        const data: unknown[] = res.data?.data ?? [];
        const pagination = res.data?.pagination ?? { totalPages: 1 };
        const tp: number = pagination.totalPages ?? 1;

        totalPagesRef.current = tp;
        pageRef.current = pg;
        setItems((prev) => (append ? [...prev, ...data] : data));
      } catch {
        // silently fail — user can retry by scrolling or searching
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    },
    [apiUrl, searchParamKey, queryParamsStr],
  );

  // Scroll-to-bottom → load next page
  const handleListScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    if (loadingMoreRef.current) return;
    if (pageRef.current >= totalPagesRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 60) {
      const next = pageRef.current + 1;
      fetchData(searchRef.current, next, true);
    }
  }, [fetchData]);

  // Open/close
  useEffect(() => {
    if (open) {
      setSearch("");
      searchRef.current = "";
      pageRef.current = 1;
      setItems([]);
      fetchData("", 1, false);
      setTimeout(() => searchInputRef.current?.focus(), 60);
    } else {
      setSearch("");
      searchRef.current = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Debounced search — fires automatically as the user types (no Enter needed)
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      searchRef.current = search;
      pageRef.current = 1;
      fetchData(search, 1, false);
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Re-fetch when external queryParams change while dropdown is open
  useEffect(() => {
    if (open) {
      setSearch("");
      searchRef.current = "";
      pageRef.current = 1;
      fetchData("", 1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParamsStr]);

  // Click outside → close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item: unknown) => {
    onChange(getValue(item), item);
    setOpen(false);
  };

  const triggerLabel = displayValue || value;

  return (
    <div ref={containerRef} className="relative">
      <label
        className={`block text-sm font-medium mb-1.5 ${
          isDark ? "text-slate-300" : "text-slate-700"
        }`}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full px-4 py-2.5 text-left flex items-center justify-between border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 ${
          isDark
            ? "bg-slate-700/50 border-slate-600/50 text-white"
            : "bg-white border-slate-300 text-slate-900"
        }`}
      >
        <span
          className={
            triggerLabel ? "" : isDark ? "text-slate-500" : "text-slate-400"
          }
        >
          {triggerLabel || placeholder}
        </span>
        <FiChevronDown
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${isDark ? "text-slate-400" : "text-slate-500"}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute z-50 mt-1 w-full rounded-xl border shadow-xl overflow-hidden ${
            isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200"
          }`}
        >
          {/* Search bar */}
          <div
            className={`p-2 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}
          >
            <div className="relative">
              <FiSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari..."
                className={`w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500/50 ${
                  isDark
                    ? "bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-500"
                    : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>

          {/* Items list */}
          <div
            ref={listRef}
            onScroll={handleListScroll}
            className="max-h-52 overflow-y-auto"
          >
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <svg
                  className="animate-spin h-5 w-5 text-emerald-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              </div>
            ) : items.length === 0 ? (
              <div
                className={`px-4 py-4 text-sm text-center ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Tidak ada data
              </div>
            ) : (
              <>
                {items.map((item, idx) => {
                  const itemValue = getValue(item);
                  const isSelected = itemValue === value;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        isSelected
                          ? isDark
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-emerald-50 text-emerald-700 font-medium"
                          : isDark
                            ? "text-slate-200 hover:bg-slate-700/70"
                            : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {getLabel(item)}
                    </button>
                  );
                })}

                {/* Loading more indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-2">
                    <svg
                      className="animate-spin h-4 w-4 text-emerald-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginatedSelectField;
