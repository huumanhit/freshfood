import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quản lý đơn hàng" };

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đơn hàng</h1>
      {/* OrderDataTable with status filter — Phase 2 */}
    </div>
  );
}
