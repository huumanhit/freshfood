import type { Metadata } from "next";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { APP_CONFIG } from "@/constants/config";
import { ProductsClient } from "@/components/products/ProductsClient";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/db";
import { Product } from "@/types/product";
import { PaginationMeta } from "@/types/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Tất cả sản phẩm — ${APP_CONFIG.name}`,
  description:
    "Khám phá hàng trăm sản phẩm thực phẩm tươi sạch và an toàn. Rau củ, thịt, hải sản, gà — giao hàng nhanh chóng nội thành TP.HCM.",
  openGraph: {
    title: `Tất cả sản phẩm — ${APP_CONFIG.name}`,
    description: "Thực phẩm tươi ngon, sạch sẽ — giao tận nhà nhanh chóng",
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

// Cached category slug validation — invalidated when admin changes categories
const validateCategorySlug = unstable_cache(
  async (slug: string) => {
    const cat = await db.category.findFirst({
      where: { slug, isActive: true },
      select: { slug: true },
    });
    return cat?.slug ?? null;
  },
  ["validate-category-slug"],
  { revalidate: 300, tags: ["categories"] }
);

async function fetchInitialProducts(sp: ProductsPageProps["searchParams"]): Promise<{
  products: Product[];
  pagination: PaginationMeta;
} | null> {
  try {
    const page = sp.page ? Math.max(1, parseInt(sp.page)) : 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const sortBy = (sp.sortBy as "price" | "name" | "createdAt") ?? "createdAt";
    const sortOrder = (sp.sortOrder as "asc" | "desc") ?? "desc";

    // Validate categorySlug using cache — avoids a live DB hit on every page nav
    let validCategorySlug: string | undefined;
    if (sp.categorySlug) {
      validCategorySlug = (await validateCategorySlug(sp.categorySlug)) ?? undefined;
    }

    const where = {
      status: "ACTIVE" as const,
      ...(sp.search && {
        OR: [
          { name: { contains: sp.search, mode: "insensitive" as const } },
          { description: { contains: sp.search, mode: "insensitive" as const } },
        ],
      }),
      ...(validCategorySlug && { category: { slug: validCategorySlug } }),
      ...(sp.minPrice && { price: { gte: parseFloat(sp.minPrice) } }),
      ...(sp.maxPrice && { price: { lte: parseFloat(sp.maxPrice) } }),
      ...(sp.isOrganic === "true" && { isOrganic: true }),
    };

    const orderBy = sortBy !== "createdAt" && sortBy !== "price" && sortBy !== "name"
      ? { createdAt: sortOrder }
      : { [sortBy]: sortOrder };

    const [total, rows] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true, name: true, slug: true,
          price: true, salePrice: true,
          stock: true, unit: true, origin: true,
          status: true, isOrganic: true, isFeatured: true, isCore: true,
          categoryId: true, createdAt: true, updatedAt: true,
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      }),
    ]);

    const products: Product[] = rows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: null,
      shortDescription: null,
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      sku: null,
      stock: p.stock,
      unit: p.unit,
      weight: null,
      origin: p.origin ?? null,
      status: p.status,
      isFeatured: p.isFeatured,
      isOrganic: p.isOrganic,
      isCore: p.isCore,
      categoryId: p.categoryId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      images: p.images,
      category: p.category ? {
        id: p.category.id,
        name: p.category.name,
        slug: p.category.slug,
        description: null,
        image: null,
        parentId: null,
        sortOrder: 0,
        isActive: true,
      } : undefined,
      reviewCount: p._count.reviews,
    }));

    const totalPages = Math.ceil(total / limit);
    return {
      products,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  } catch {
    return null;
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const initial = await fetchInitialProducts(searchParams);

  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsClient
        initialSearchParams={searchParams}
        initialProducts={initial?.products}
        initialPagination={initial?.pagination}
      />
    </Suspense>
  );
}
