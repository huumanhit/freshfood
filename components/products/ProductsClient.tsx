"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import { buildSearchParams } from "@/lib/utils";
import { ProductFilters, FilterState } from "@/components/products/ProductFilters";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductSort } from "@/components/products/ProductSort";
import { ActiveFilters } from "@/components/products/ActiveFilters";
import { Pagination } from "@/components/shared/Pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/types/product";
import { PaginationMeta } from "@/types/api";

const PRICE_MAX = 1000000;

interface ProductsClientProps {
  initialSearchParams: {
    page?: string;
    search?: string;
    categorySlug?: string;
    minPrice?: string;
    maxPrice?: string;
    isOrganic?: string;
    sortBy?: string;
    sortOrder?: string;
  };
  initialProducts?: Product[];
  initialPagination?: PaginationMeta;
}

function buildInitialFilters(sp: ProductsClientProps["initialSearchParams"]): FilterState {
  return {
    search: sp.search ?? "",
    categorySlug: sp.categorySlug ?? "",
    minPrice: sp.minPrice ? parseInt(sp.minPrice) : 0,
    maxPrice: sp.maxPrice ? parseInt(sp.maxPrice) : PRICE_MAX,
    isOrganic: sp.isOrganic === "true",
    sortBy: sp.sortBy ?? "createdAt",
    sortOrder: sp.sortOrder ?? "desc",
    page: sp.page ? parseInt(sp.page) : 1,
  };
}

export function ProductsClient({ initialSearchParams, initialProducts, initialPagination }: ProductsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<FilterState>(() =>
    buildInitialFilters(initialSearchParams)
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 400);
  const queryFilters = { ...filters, search: debouncedSearch };

  const serverPlaceholder = initialProducts && initialPagination
    ? {
        success: true,
        data: initialProducts,
        pagination: initialPagination,
      }
    : undefined;

  const { data, isLoading } = useProducts(
    {
      page: queryFilters.page,
      search: queryFilters.search || undefined,
      categorySlug: queryFilters.categorySlug || undefined,
      minPrice: queryFilters.minPrice > 0 ? queryFilters.minPrice : undefined,
      maxPrice: queryFilters.maxPrice < PRICE_MAX ? queryFilters.maxPrice : undefined,
      isOrganic: queryFilters.isOrganic || undefined,
      sortBy: queryFilters.sortBy as "price" | "name" | "createdAt" | "soldCount" | "rating",
      sortOrder: queryFilters.sortOrder as "asc" | "desc",
    },
    serverPlaceholder
  );

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  // Sync filters → URL (debounced)
  const debouncedFilters = useDebounce(filters, 600);
  useEffect(() => {
    const params = buildSearchParams({
      page: debouncedFilters.page > 1 ? debouncedFilters.page : undefined,
      search: debouncedFilters.search || undefined,
      categorySlug: debouncedFilters.categorySlug || undefined,
      minPrice: debouncedFilters.minPrice > 0 ? debouncedFilters.minPrice : undefined,
      maxPrice: debouncedFilters.maxPrice < PRICE_MAX ? debouncedFilters.maxPrice : undefined,
      isOrganic: debouncedFilters.isOrganic || undefined,
      sortBy: debouncedFilters.sortBy !== "createdAt" ? debouncedFilters.sortBy : undefined,
      sortOrder: debouncedFilters.sortOrder !== "desc" ? debouncedFilters.sortOrder : undefined,
    });
    router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`, { scroll: false });
  }, [debouncedFilters, pathname, router]);

  const handleChange = useCallback((partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  function handleReset() {
    setFilters({
      search: "",
      categorySlug: "",
      minPrice: 0,
      maxPrice: PRICE_MAX,
      isOrganic: false,
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
    });
  }

  return (
    <div className="container py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-gray-900">Tất cả sản phẩm</h1>
        <p className="text-sm text-gray-500 mt-1">
          Thực phẩm sạch, tươi ngon — giao tận nhà trong 2–3h
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6 max-w-lg">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Tìm sản phẩm (cải bó xôi, cá hồi, thịt bò...)"
          value={filters.search}
          onChange={(e) => handleChange({ search: e.target.value, page: 1 })}
          className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent placeholder:text-gray-400 shadow-sm"
        />
        {filters.search && (
          <button
            onClick={() => handleChange({ search: "", page: 1 })}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <ProductFilters
              filters={filters}
              onChange={handleChange}
              onReset={handleReset}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          <ProductSort
            total={pagination?.total ?? 0}
            isLoading={isLoading}
            filters={filters}
            onChange={handleChange}
            onOpenMobileFilter={() => setMobileFilterOpen(true)}
          />

          <ActiveFilters filters={filters} onChange={handleChange} />

          <ProductGrid products={products} isLoading={isLoading} />

          {pagination && pagination.totalPages > 1 && (
            <div className="pt-4">
              <Pagination
                meta={pagination}
                className="justify-center"
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="px-5 py-4 border-b">
            <SheetTitle>Bộ lọc</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
            <div className="px-5 py-4">
              <ProductFilters
                filters={filters}
                onChange={(partial) => {
                  handleChange(partial);
                }}
                onReset={() => {
                  handleReset();
                  setMobileFilterOpen(false);
                }}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
