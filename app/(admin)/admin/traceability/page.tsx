import type { Metadata } from "next";
import { TraceabilityManager } from "@/components/admin/traceability/TraceabilityManager";
import { Phase2UnderDevelopment } from "@/components/admin/shared/Phase2UnderDevelopment";

export const metadata: Metadata = { title: "Truy xuất nguồn gốc" };
export const dynamic = "force-dynamic";

// Chuyển thành true khi khách hàng chốt kích hoạt Phase 2
const ENABLE_PHASE_2 = false;

export default function AdminTraceabilityPage() {
  if (!ENABLE_PHASE_2) {
    return (
      <Phase2UnderDevelopment
        featureName="Truy xuất nguồn gốc & Quản lý lô hàng"
        description="Chức năng quản lý lô nhập, nhật ký sự kiện kiểm định và truy xuất nguồn gốc nông sản từ nhà cung cấp đến tay khách hàng. Thuộc phạm vi nâng cấp Phase 2."
        plannedFeatures={[
          "Quản lý mã lô hàng nhập và hạn sử dụng theo từng ngày",
          "Ghi nhận nhật ký sự kiện: Kiểm định → Nhập kho → Đóng gói → Giao hàng",
          "Truy xuất thông tin nhà cung cấp của từng mặt hàng",
        ]}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Truy xuất nguồn gốc</h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi lô hàng từ nhà cung cấp đến tay khách hàng với nhật ký sự kiện đầy đủ
        </p>
      </div>
      <TraceabilityManager />
    </div>
  );
}
