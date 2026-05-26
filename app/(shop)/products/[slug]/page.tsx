import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { APP_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { ProductInfo } from "@/components/products/ProductInfo";
import { ProductReviews } from "@/components/products/ProductReviews";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      shortDescription: true,
      metaTitle: true,
      metaDescription: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  if (!product) return { title: "Sản phẩm không tồn tại" };

  return {
    title: `${product.metaTitle ?? product.name} — ${APP_CONFIG.name}`,
    description: product.metaDescription ?? product.shortDescription ?? APP_CONFIG.description,
    openGraph: {
      title: product.metaTitle ?? product.name,
      description: product.metaDescription ?? product.shortDescription ?? undefined,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}


export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    select: {
      id: true, name: true, slug: true,
      description: true, shortDescription: true,
      price: true, salePrice: true,
      sku: true, stock: true, unit: true, weight: true,
      origin: true, status: true,
      isFeatured: true, isOrganic: true,
      categoryId: true, soldCount: true,
      metaTitle: true, metaDescription: true, tags: true,
      createdAt: true, updatedAt: true,
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { reviews: true } },
    },
  });

  if (!product || product.status === "INACTIVE") notFound();

  // Compute average rating from the DB
  const ratingAgg = await db.review.aggregate({
    where: { productId: product.id, isVisible: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const averageRating = ratingAgg._avg.rating ?? 0;
  const reviewCount = ratingAgg._count.rating;

  // Related products — same category, excluding current
  const related = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "ACTIVE",
    },
    select: {
      id: true, name: true, slug: true,
      price: true, salePrice: true,
      stock: true, unit: true, origin: true,
      isOrganic: true, isFeatured: true,
      categoryId: true,
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  // Increment view count (fire-and-forget — silently skipped if column not yet migrated)
  db.$executeRawUnsafe(
    `UPDATE "products" SET "viewCount" = "viewCount" + 1 WHERE "id" = $1`,
    product.id
  ).catch(() => {});

  const productWithRating = {
    ...product,
    averageRating,
    reviewCount,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    weight: product.weight ? Number(product.weight) : null,
  };

  const relatedWithTypes = related.map((p) => ({
    ...p,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    averageRating: undefined,
    reviewCount: p._count.reviews,
  }));

  return (
    <div className="bg-white min-h-screen">
      <div className="container py-6 space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 flex-wrap">
          <Link href={ROUTES.HOME} className="hover:text-[#22c55e] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={ROUTES.PRODUCTS} className="hover:text-[#22c55e] transition-colors">
            Sản phẩm
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={ROUTES.CATEGORY(product.category.slug)}
                className="hover:text-[#22c55e] transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-600 line-clamp-1 max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main product section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Gallery */}
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />

          {/* Info */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ProductInfo product={productWithRating as any} />
        </div>

        <Separator />

        {/* Description + Reviews tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full sm:w-auto rounded-2xl h-12 p-1 bg-gray-100">
            <TabsTrigger
              value="description"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#22c55e] data-[state=active]:font-semibold px-6"
            >
              Mô tả sản phẩm
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#22c55e] data-[state=active]:font-semibold px-6"
            >
              Đánh giá
              {reviewCount > 0 && (
                <span className="ml-1.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] px-1.5 py-0.5 text-xs font-semibold">
                  {reviewCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            {product.description ? (
              <div
                className="prose prose-sm max-w-none text-gray-600 leading-relaxed [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-gray-400 text-sm py-4">Chưa có mô tả chi tiết cho sản phẩm này.</p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ProductReviews
              productId={product.id}
              averageRating={averageRating}
              reviewCount={reviewCount}
            />
          </TabsContent>
        </Tabs>

        {/* Related products */}
        {related.length > 0 && (
          <>
            <Separator />
            <RelatedProducts
              products={relatedWithTypes as never}
              categoryName={product.category?.name}
              categorySlug={product.category?.slug}
            />
          </>
        )}
      </div>
    </div>
  );
}
