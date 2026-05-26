import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/categories/CategoryManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Danh mục sản phẩm" };

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Danh mục</h1>
        <p className="text-sm text-gray-500 mt-0.5">Quản lý danh mục sản phẩm trong cửa hàng</p>
      </div>
      <CategoryManager />
    </div>
  );
}
