import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { AdminOrdersTable } from "@/components/admin/orders/AdminOrdersTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Quản lý đơn hàng" };

export default function AdminOrdersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý và xử lý tất cả đơn hàng</p>
        </div>
        <Link
          href="/api/admin/orders/export"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Download className="h-4 w-4" />
          Xuất CSV
        </Link>
      </div>
      <AdminOrdersTable />
    </div>
  );
}
