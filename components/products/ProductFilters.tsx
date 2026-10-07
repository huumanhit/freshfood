"use client";

import { Leaf, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-categories";
import { formatCurrency, cn } from "@/lib/utils";

export interface FilterState {
  search: string;
  categorySlug: string;
  minPrice: number;
  maxPrice: number;
  isOrganic: boolean;
  sortBy: string;
  sortOrder: string;
  page: number;
}

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (partial: Partial<FilterState>) => void;
  onReset: () => void;
}

const PRICE_MIN = 0;
const PRICE_MAX = 1000000;

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-gray-800 hover:text-[#22c55e] transition-colors"
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductFilters({ filters, onChange, onReset }: ProductFiltersProps) {
  const { data: categories, isLoading } = useCategories();
  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice]);

  const hasActiveFilters =
    filters.categorySlug !== "" ||
    filters.isOrganic ||
    filters.minPrice > PRICE_MIN ||
    filters.maxPrice < PRICE_MAX;

  function handlePriceCommit(values: number[]) {
    onChange({ minPrice: values[0], maxPrice: values[1], page: 1 });
  }

  return (
    <aside className="w-full space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            <X className="h-3 w-3" />
            Xóa lọc
          </button>
        )}
      </div>

      <Separator />

      {/* Category */}
      <FilterSection title="Danh mục">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onChange({ categorySlug: "", page: 1 })}
              className={cn(
                "flex w-full items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-sm transition-all group",
                filters.categorySlug === ""
                  ? "bg-green-50 font-semibold text-[#16a34a]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                    filters.categorySlug === ""
                      ? "bg-[#16a34a] border-[#16a34a] text-white"
                      : "border-gray-300 group-hover:border-[#16a34a]"
                  )}
                >
                  {filters.categorySlug === "" && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span>Tất cả</span>
              </div>
            </button>

            {categories?.map((cat) => {
              const isSelected = filters.categorySlug === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      categorySlug: isSelected ? "" : cat.slug,
                      page: 1,
                    })
                  }
                  className={cn(
                    "flex w-full items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-sm transition-all group",
                    isSelected
                      ? "bg-green-50 font-semibold text-[#16a34a]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                        isSelected
                          ? "bg-[#16a34a] border-[#16a34a] text-white"
                          : "border-gray-300 group-hover:border-[#16a34a]"
                      )}
                    >
                      {isSelected && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  {cat._count && (
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {cat._count.products}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </FilterSection>

      <Separator />

      {/* Price range */}
      <FilterSection title="Giá">
        <div className="space-y-4 px-1">
          <Slider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={10000}
            value={priceRange}
            onValueChange={setPriceRange}
            onValueCommit={handlePriceCommit}
            className="[&_[data-slot=track]]:bg-gray-200 [&_[data-slot=range]]:bg-[#16a34a] [&_[data-slot=thumb]]:border-[#22c55e]"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="rounded-lg bg-gray-50 border px-2 py-1">
              {formatCurrency(priceRange[0])}
            </span>
            <span className="text-gray-300">—</span>
            <span className="rounded-lg bg-gray-50 border px-2 py-1">
              {formatCurrency(priceRange[1])}
            </span>
          </div>
        </div>
      </FilterSection>

      <Separator />

      {/* Organic */}
      <FilterSection title="Loại sản phẩm">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <Checkbox
            checked={filters.isOrganic}
            onCheckedChange={(v) => onChange({ isOrganic: !!v, page: 1 })}
            className="data-[state=checked]:bg-[#16a34a] data-[state=checked]:border-[#22c55e]"
          />
          <span className="flex items-center gap-1.5 text-sm text-gray-600 group-hover:text-[#22c55e] transition-colors">
            <Leaf className="h-3.5 w-3.5 text-green-500" />
            Hàng hữu cơ (Organic)
          </span>
        </label>
      </FilterSection>

      <Separator />

      {hasActiveFilters && (
        <div className="pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full rounded-xl text-red-500 border-red-200 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Xóa tất cả bộ lọc
          </Button>
        </div>
      )}
    </aside>
  );
}
