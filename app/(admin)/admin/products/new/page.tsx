import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { ROUTES } from "@/constants/routes";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thêm sản phẩm" };

export default function AdminProductNewPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link
          href={ROUTES.ADMIN_PRODUCTS}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#22c55e] transition-colors mb-2"
        >
          <ChevronLeft className="h-4 w-4" /> Danh sách sản phẩm
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
      </div>
      <ProductForm />
    </div>
  );
}
