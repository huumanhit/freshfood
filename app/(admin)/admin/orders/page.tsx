import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminOrdersTable } from "@/components/admin/orders/AdminOrdersTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Quản lý đơn hàng" };

export default function AdminOrdersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý và xử lý tất cả đơn hàng</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16a34a] text-white text-sm font-medium hover:bg-[#15803d] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tạo đơn thủ công
        </Link>
      </div>
      <AdminOrdersTable />
    </div>
  );
}
