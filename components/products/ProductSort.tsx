"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterState } from "@/components/products/ProductFilters";

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Mới nhất" },
  { value: "soldCount:desc", label: "Bán chạy nhất" },
  { value: "price:asc", label: "Giá thấp đến cao" },
  { value: "price:desc", label: "Giá cao đến thấp" },
  { value: "name:asc", label: "Tên A → Z" },
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

  function handleSortChange(value: string) {
    const [sortBy, sortOrder] = value.split(":");
    onChange({ sortBy, sortOrder, page: 1 });
  }

  return (
    <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
      {/* Results count */}
      <p className="text-sm text-gray-500 whitespace-nowrap">
        {isLoading ? (
          <span className="inline-block h-4 w-28 animate-pulse rounded bg-gray-200" />
        ) : (
          <>
            <span className="font-semibold text-gray-800">{total.toLocaleString("vi-VN")}</span>
            {" "}sản phẩm
          </>
        )}
      </p>

      <div className="flex items-center gap-2">
        {/* Mobile filter button */}
        <button
          onClick={onOpenMobileFilter}
          className="lg:hidden flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-green-300 hover:text-green-600 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Bộ lọc
        </button>

        {/* Sort select */}
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px] rounded-xl border-gray-200 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-sm">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
