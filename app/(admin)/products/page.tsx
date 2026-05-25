import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quản lý sản phẩm" };

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sản phẩm</h1>
        {/* AddProductButton — Phase 2 */}
      </div>
      {/* ProductDataTable — Phase 2 */}
    </div>
  );
}
