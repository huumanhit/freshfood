import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { CustomersTable } from "@/components/admin/crm/CustomersTable";

export const metadata: Metadata = { title: "Khách hàng" };
export const dynamic = "force-dynamic";

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khách hàng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý khách hàng, điểm tích lũy, phân khúc và cảnh báo rủi ro
          </p>
        </div>
        <Link
          href="/api/admin/customers/export"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Download className="h-4 w-4" />
          Xuất CSV
        </Link>
      </div>
      <CustomersTable />
    </div>
  );
}
