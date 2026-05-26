import type { Metadata } from "next";
import { MergeOrdersBoard } from "@/components/admin/merge-orders/MergeOrdersBoard";

export const metadata: Metadata = { title: "Gộp đơn hàng" };
export const dynamic = "force-dynamic";

export default function AdminMergeOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gộp đơn hàng</h1>
        <p className="text-sm text-gray-500 mt-1">
          Phát hiện và gộp các đơn hàng trùng lặp cùng khách hàng, cùng ngày, cùng khung giờ giao
        </p>
      </div>
      <MergeOrdersBoard />
    </div>
  );
}
