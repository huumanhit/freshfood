"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, X, AlertCircle, RefreshCw } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useDebounce } from "@/hooks/use-debounce";
import { buildSearchParams } from "@/lib/utils";
import { DEFAULT_AFTER_HOURS, isAfterHoursClient } from "@/lib/business/ordering";
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

function sanitizeSearch(s?: string): string {
  if (!s) return "";
  // Ignore Google Sitelinks Searchbox placeholder if crawler visits the template URL directly
  if (s.startsWith("{") && s.endsWith("}")) return "";
  return s;
}

function buildInitialFilters(sp: ProductsClientProps["initialSearchParams"]): FilterState {
  return {
    search: sanitizeSearch(sp.search),
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
  const [afterHours, setAfterHours] = useState(false);

  useEffect(() => {
    fetch("/api/checkout/config")
      .then((r) => r.json())
      .then(({ afterHoursCutoff }) => {
        setAfterHours(isAfterHoursClient(afterHoursCutoff ?? DEFAULT_AFTER_HOURS));
      })
      .catch(() => setAfterHours(isAfterHoursClient(DEFAULT_AFTER_HOURS)));
  }, []);

  // Auto-clear invalid categorySlug when categories are loaded
  const { data: categoriesData } = useCategories();
  useEffect(() => {
    if (!categoriesData || !filters.categorySlug) return;
    const validSlugs = categoriesData.map((c) => c.slug);
    if (!validSlugs.includes(filters.categorySlug)) {
      setFilters((prev) => ({ ...prev, categorySlug: "", page: 1 }));
    }
  }, [categoriesData, filters.categorySlug]);

  const debouncedSearch = useDebounce(filters.search, 400);
  const queryFilters = { ...filters, search: debouncedSearch };

  const serverInitial = initialProducts && initialPagination
    ? {
        success: true,
        data: initialProducts,
        pagination: initialPagination,
      }
    : undefined;

  const { data, isLoading, isError, refetch } = useProducts(
    {
      page: queryFilters.page,
      search: queryFilters.search || undefined,
      categorySlug: queryFilters.categorySlug || undefined,
      minPrice: queryFilters.minPrice > 0 ? queryFilters.minPrice : undefined,
      maxPrice: queryFilters.maxPrice < PRICE_MAX ? queryFilters.maxPrice : undefined,
      isOrganic: queryFilters.isOrganic || undefined,
      isCore: afterHours ? true : undefined,
      sortBy: queryFilters.sortBy as "price" | "name" | "createdAt" | "soldCount" | "rating",
      sortOrder: queryFilters.sortOrder as "asc" | "desc",
    },
    serverInitial
  );

  const lastGoodDataRef = useRef<{ products: Product[]; pagination: PaginationMeta } | null>(
    serverInitial ? { products: serverInitial.data, pagination: serverInitial.pagination! } : null
  );
  if (data?.data?.length) {
    lastGoodDataRef.current = { products: data.data, pagination: data.pagination! };
  }

  const products = data?.data ?? lastGoodDataRef.current?.products ?? [];
  const pagination = data?.pagination ?? lastGoodDataRef.current?.pagination;

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

  if (isError && !products.length) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">Không thể tải sản phẩm</h3>
            <p className="text-sm text-gray-400 mt-1">Vui lòng kiểm tra kết nối và thử lại.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#16a34a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#16a34a] transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 lg:py-8">
      {/* Page heading */}
      <div className="mb-4 lg:mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#22c55e] mb-0.5">Cửa hàng</p>
        <h1 className="text-2xl lg:text-3xl font-bold font-display text-gray-900">Tất cả sản phẩm</h1>
        <p className="text-xs lg:text-sm text-gray-400 mt-0.5 hidden lg:block">
          Thực phẩm sạch, tươi ngon — giao tận nhà trong 2–3h
        </p>
      </div>

      {/* After-hours notice — PA1 */}
      {afterHours && (
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
          <span className="text-lg leading-none">🌙</span>
          <div>
            <p className="font-semibold">Sau giờ chốt — chỉ hiển thị món phổ thông</p>
            <p className="text-xs text-amber-600 mt-0.5">Đặt ngay, giao từ 9h sáng hôm sau. Các món đặc biệt sẽ hiện lại vào sáng sớm.</p>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-4 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Tìm sản phẩm (cải bó xôi, cá hồi, thịt bò...)"
          value={filters.search}
          onChange={(e) => handleChange({ search: e.target.value, page: 1 })}
          className="w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent placeholder:text-gray-400 shadow-sm transition-shadow hover:shadow-md"
        />
        {filters.search && (
          <button
            onClick={() => handleChange({ search: "", page: 1 })}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                onPageChange={(p) => {
                  handleChange({ page: p });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
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
