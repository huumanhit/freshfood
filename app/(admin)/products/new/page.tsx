import type { Metadata } from "next";

export const metadata: Metadata = { title: "Thêm sản phẩm" };

export default function AdminProductNewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Thêm sản phẩm mới</h1>
      {/* ProductForm — Phase 2 */}
    </div>
  );
}
