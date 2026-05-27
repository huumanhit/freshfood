"use client";

import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, ArrowUpDown, ChevronDown, Check } from "lucide-react";
import { FilterState } from "@/components/products/ProductFilters";

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Mới nhất" },
  { value: "soldCount:desc", label: "Bán chạy nhất" },
  { value: "price:asc",      label: "Giá thấp → cao" },
  { value: "price:desc",     label: "Giá cao → thấp" },
  { value: "name:asc",       label: "Tên A → Z" },
];

interface ProductSortProps {
  total: number;
  isLoading: boolean;
  filters: FilterState;
  onChange: (partial: Partial<FilterState>) => void;
  onOpenMobileFilter: () => void;
}

export function ProductSort({ total, isLoading, filters, onChange, onOpenMobileFilter }: ProductSortProps) {
  const currentSort = `${filters.sortBy}:${filters.sortOrder}`;
  const currentLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? "Sắp xếp";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSortChange(value: string) {
    const [sortBy, sortOrder] = value.split(":");
    onChange({ sortBy, sortOrder, page: 1 });
    setOpen(false);
  }

  return (
    <div className="space-y-2 pb-3 border-b border-gray-100">
      {/* ── Mobile toolbar ── */}
      <div className="lg:hidden flex items-center gap-2">
        {/* Count */}
        <p className="flex-1 text-sm text-gray-500">
          {isLoading ? (
            <span className="inline-block h-4 w-20 animate-pulse rounded bg-gray-200" />
          ) : (
            <><span className="font-semibold text-gray-800">{total.toLocaleString("vi-VN")}</span> sản phẩm</>
          )}
        </p>

        {/* Filter button */}
        <button
          onClick={onOpenMobileFilter}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 active:bg-gray-50"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Bộ lọc
        </button>

        {/* Sort dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 active:bg-gray-50"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
            <span className="max-w-[80px] truncate">{currentLabel}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[170px] rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm text-left hover:bg-green-50 transition-colors"
                >
                  <span className={currentSort === opt.value ? "font-semibold text-green-700" : "text-gray-700"}>
                    {opt.label}
                  </span>
                  {currentSort === opt.value && <Check className="h-4 w-4 text-green-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop toolbar ── */}
      <div className="hidden lg:flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {isLoading ? (
            <span className="inline-block h-4 w-28 animate-pulse rounded bg-gray-200" />
          ) : (
            <><span className="font-semibold text-gray-800">{total.toLocaleString("vi-VN")}</span> sản phẩm</>
          )}
        </p>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-green-300 hover:text-green-700 transition-colors"
          >
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            {currentLabel}
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[190px] rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm text-left hover:bg-green-50 transition-colors"
                >
                  <span className={currentSort === opt.value ? "font-semibold text-green-700" : "text-gray-700"}>
                    {opt.label}
                  </span>
                  {currentSort === opt.value && <Check className="h-4 w-4 text-green-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
