import type { Metadata } from "next";
import { DeliveryBoard } from "@/components/admin/delivery/DeliveryBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Quản lý giao hàng" };

export default function AdminDeliveryPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Giao hàng</h1>
        <p className="text-sm text-gray-500 mt-0.5">Theo dõi và cập nhật trạng thái giao hàng</p>
      </div>
      <DeliveryBoard />
    </div>
  );
}
