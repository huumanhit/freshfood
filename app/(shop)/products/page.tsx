import type { Metadata } from "next";
import { Suspense } from "react";
import { APP_CONFIG } from "@/constants/config";
import { ProductsClient } from "@/components/products/ProductsClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: `Tất cả sản phẩm — ${APP_CONFIG.name}`,
  description:
    "Khám phá hàng trăm sản phẩm thực phẩm sạch, tươi ngon, đạt chuẩn VietGAP. Rau củ, thịt, hải sản, gà — giao hàng 2–3h nội thành TP.HCM.",
  openGraph: {
    title: `Tất cả sản phẩm — ${APP_CONFIG.name}`,
    description: "Thực phẩm sạch, tươi ngon — giao tận nhà trong 2–3h",
  },
};

interface ProductsPageProps {
  searchParams: {
    page?: string;
    search?: string;
    categorySlug?: string;
    minPrice?: string;
    maxPrice?: string;
    isOrganic?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

function ProductsPageSkeleton() {
  return (
    <div className="container py-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-full max-w-lg rounded-2xl" />
      <div className="flex gap-8">
        <div className="hidden lg:block w-56 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-2xl border overflow-hidden">
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsClient initialSearchParams={searchParams} />
    </Suspense>
  );
}
