import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { ROUTES } from "@/constants/routes";

interface AdminProductEditPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: AdminProductEditPageProps): Promise<Metadata> {
  const product = await db.product.findUnique({ where: { id: params.id }, select: { name: true } });
  return { title: product ? `Sửa: ${product.name}` : "Sản phẩm không tồn tại" };
}

export default async function AdminProductEditPage({ params }: AdminProductEditPageProps) {
  const product = await db.product.findUnique({
    where: { id: params.id },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      category: { select: { id: true, name: true } },
    },
  });

  if (!product) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={ROUTES.ADMIN_PRODUCTS}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#22c55e] transition-colors mb-2"
        >
          <ChevronLeft className="h-4 w-4" /> Danh sách sản phẩm
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Sửa sản phẩm</h1>
        <p className="text-sm text-gray-500 mt-0.5">{product.name}</p>
      </div>
      <ProductForm
        productId={product.id}
        defaultValues={{
          name: product.name,
          shortDescription: product.shortDescription ?? undefined,
          description: product.description ?? undefined,
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : null,
          sku: product.sku ?? undefined,
          stock: product.stock,
          unit: product.unit,
          weight: product.weight ? Number(product.weight) : null,
          origin: product.origin ?? undefined,
          status: product.status,
          isFeatured: product.isFeatured,
          isOrganic: product.isOrganic,
          isCore: product.isCore,
          categoryId: product.categoryId,
          images: product.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary })),
        }}
      />
    </div>
  );
}
