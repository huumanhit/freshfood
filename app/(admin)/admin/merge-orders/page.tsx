import type { Metadata } from "next";
import { MergeOrdersBoard } from "@/components/admin/merge-orders/MergeOrdersBoard";
import { Phase2UnderDevelopment } from "@/components/admin/shared/Phase2UnderDevelopment";

export const metadata: Metadata = { title: "Gộp đơn hàng" };
export const dynamic = "force-dynamic";

// Chuyển thành true khi khách hàng chốt kích hoạt Phase 2
const ENABLE_PHASE_2 = false;

export default function AdminMergeOrdersPage() {
  if (!ENABLE_PHASE_2) {
    return (
      <Phase2UnderDevelopment
        featureName="Tự động gộp đơn hàng trùng khách"
        description="Chức năng phát hiện và gộp các đơn hàng cùng SĐT, cùng ngày, cùng khung giờ giao hàng tự động. Thuộc phạm vi nâng cấp Phase 2."
        plannedFeatures={[
          "Quét tự động đơn trùng khách trong ngày và cùng khung giờ",
          "Cộng dồn số lượng từng món và ghi chú vào đơn chính",
          "Tự động hủy các đơn trùng lặp và tính lại tổng tiền",
        ]}
      />
    );
  }

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
