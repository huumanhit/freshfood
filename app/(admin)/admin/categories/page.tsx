import type { Metadata } from "next";

export const metadata: Metadata = { title: "Danh mục sản phẩm" };

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Danh mục</h1>
      {/* CategoryTree + CategoryForm — Phase 2 */}
    </div>
  );
}
