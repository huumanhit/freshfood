"use client";

import { X, Leaf } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { formatCurrency } from "@/lib/utils";
import { FilterState } from "@/components/products/ProductFilters";

const PRICE_MAX = 1000000;

interface ActiveFiltersProps {
  filters: FilterState;
  onChange: (partial: Partial<FilterState>) => void;
}

export function ActiveFilters({ filters, onChange }: ActiveFiltersProps) {
  const { data: categories } = useCategories();
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.search) {
    chips.push({
      key: "search",
      label: `"${filters.search}"`,
      onRemove: () => onChange({ search: "", page: 1 }),
    });
  }

  if (filters.categorySlug) {
    const cat = categories?.find((c) => c.slug === filters.categorySlug);
    chips.push({
      key: "category",
      label: cat?.name ?? filters.categorySlug,
      onRemove: () => onChange({ categorySlug: "", page: 1 }),
    });
  }

  if (filters.minPrice > 0 || filters.maxPrice < PRICE_MAX) {
    chips.push({
      key: "price",
      label: `${formatCurrency(filters.minPrice)} – ${formatCurrency(filters.maxPrice)}`,
      onRemove: () => onChange({ minPrice: 0, maxPrice: PRICE_MAX, page: 1 }),
    });
  }

  if (filters.isOrganic) {
    chips.push({
      key: "organic",
      label: "Hữu cơ",
      onRemove: () => onChange({ isOrganic: false, page: 1 }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pb-3">
      <span className="text-xs text-gray-400 font-medium">Đang lọc:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700"
        >
          {chip.key === "organic" && <Leaf className="h-3 w-3" />}
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="text-green-500 hover:text-green-800 transition-colors ml-0.5"
            aria-label="Xóa bộ lọc"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
