import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { REVALIDATE } from "@/constants/config";

export const revalidate = REVALIDATE.PRODUCTS;

interface ProductDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, shortDescription: true, metaTitle: true, metaDescription: true },
  });

  if (!product) return { title: "Sản phẩm không tồn tại" };

  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.shortDescription ?? undefined,
  };
}

export async function generateStaticParams() {
  const products = await db.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true },
    take: 200,
  });
  return products.map(({ slug }) => ({ slug }));
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      category: true,
    },
  });

  if (!product || product.status === "INACTIVE") notFound();

  return (
    <div className="container py-8">
      {/* ProductGallery — Phase 2 */}
      {/* ProductInfo — Phase 2 */}
      {/* ProductReviews — Phase 2 */}
      {/* RelatedProducts — Phase 2 */}
    </div>
  );
}
