import type { Metadata } from "next";
import { AdminProductsTable } from "@/components/admin/products/AdminProductsTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Quản lý sản phẩm" };

export default function AdminProductsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
        <p className="text-sm text-gray-500 mt-0.5">Quản lý danh sách sản phẩm trong cửa hàng</p>
      </div>
      <AdminProductsTable />
    </div>
  );
}
