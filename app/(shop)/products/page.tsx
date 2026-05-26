import type { Metadata } from "next";
import { Suspense } from "react";
import { APP_CONFIG, REVALIDATE } from "@/constants/config";
import { ProductsClient } from "@/components/products/ProductsClient";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const revalidate = REVALIDATE.PRODUCTS;

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

async function ProductsServer({ searchParams }: ProductsPageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1") || 1);
  const limit = 12;
  const skip = (page - 1) * limit;
  const search = searchParams.search;
  const categorySlug = searchParams.categorySlug;
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;
  const isOrganic = searchParams.isOrganic === "true" ? true : undefined;
  const sortBy = (searchParams.sortBy ?? "createdAt") as "price" | "name" | "createdAt" | "soldCount" | "rating";
  const sortOrder = (searchParams.sortOrder ?? "desc") as "asc" | "desc";

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(minPrice !== undefined && { price: { gte: minPrice } }),
    ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
    ...(isOrganic !== undefined && { isOrganic }),
  };

  const orderBy = sortBy === "rating" ? undefined : { [sortBy]: sortOrder };

  let initialProducts = undefined;
  let initialPagination = undefined;

  try {
    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    initialProducts = products;
    initialPagination = { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  } catch {
    // fall back to client-side fetch
  }

  return (
    <ProductsClient
      initialSearchParams={searchParams}
      initialProducts={initialProducts as never}
      initialPagination={initialPagination}
    />
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsServer searchParams={searchParams} />
    </Suspense>
  );
}
