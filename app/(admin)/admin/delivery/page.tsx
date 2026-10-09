import type { Metadata } from "next";
import { DeliveryBoard } from "@/components/admin/delivery/DeliveryBoard";
import { Phase2UnderDevelopment } from "@/components/admin/shared/Phase2UnderDevelopment";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quản lý giao hàng" };

// Chuyển thành true khi khách hàng chốt kích hoạt Phase 2
const ENABLE_PHASE_2 = false;

export default function AdminDeliveryPage() {
  if (!ENABLE_PHASE_2) {
    return (
      <Phase2UnderDevelopment
        featureName="Điều phối giao hàng & GPS tài xế thời gian thực"
        description="Chức năng điều phối đội ngũ tài xế riêng, theo dõi vị trí GPS và tối ưu tuyến đường giao hàng nhiều điểm. Trong Phase 1, chủ shop có thể mở nút Google Maps chỉ đường trực tiếp trên từng đơn hàng."
        plannedFeatures={[
          "Bảng Kanban theo dõi đơn theo thời gian thực (Đang lấy hàng → Đang giao → Hoàn tất)",
          "Theo dõi tọa độ GPS trực tiếp của tài xế trên bản đồ",
          "Tự động tính toán và tối ưu lộ trình giao nhiều điểm ngắn nhất",
        ]}
      />
    );
  }

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
