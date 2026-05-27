import type { Metadata } from "next";
import { AdminOrdersTable } from "@/components/admin/orders/AdminOrdersTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Quản lý đơn hàng" };

export default function AdminOrdersPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
        <p className="text-sm text-gray-500 mt-0.5">Quản lý và xử lý tất cả đơn hàng</p>
      </div>
      <AdminOrdersTable />
    </div>
  );
}
