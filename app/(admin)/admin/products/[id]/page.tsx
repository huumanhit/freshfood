import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

interface AdminProductEditPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: AdminProductEditPageProps): Promise<Metadata> {
  const product = await db.product.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  return { title: product ? `Sửa: ${product.name}` : "Sản phẩm không tồn tại" };
}

export default async function AdminProductEditPage({ params }: AdminProductEditPageProps) {
  const product = await db.product.findUnique({
    where: { id: params.id },
    include: { images: true },
  });

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sửa sản phẩm</h1>
      {/* ProductForm with defaultValues — Phase 2 */}
    </div>
  );
}
