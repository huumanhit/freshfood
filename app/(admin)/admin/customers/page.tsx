import type { Metadata } from "next";
import { CustomersTable } from "@/components/admin/crm/CustomersTable";

export const metadata: Metadata = { title: "Khách hàng" };
export const dynamic = "force-dynamic";

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Khách hàng</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý khách hàng, điểm tích lũy, phân khúc và cảnh báo rủi ro
        </p>
      </div>
      <CustomersTable />
    </div>
  );
}
