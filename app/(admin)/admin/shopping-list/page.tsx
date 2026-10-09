import type { Metadata } from "next";
import { ShoppingListManager } from "@/components/admin/shopping-list/ShoppingListManager";
import { Phase2UnderDevelopment } from "@/components/admin/shared/Phase2UnderDevelopment";

export const metadata: Metadata = { title: "Danh sách mua hàng" };
export const dynamic = "force-dynamic";

// Chuyển thành true khi khách hàng chốt kích hoạt Phase 2
const ENABLE_PHASE_2 = false;

export default function AdminShoppingListPage() {
  if (!ENABLE_PHASE_2) {
    return (
      <Phase2UnderDevelopment
        featureName="Danh sách tổng hợp đi chợ tự động"
        description="Chức năng tự động tổng hợp số lượng từng món cần mua theo ngày đi chợ và phân nhóm theo nhà cung cấp. Trong Phase 1, bạn có thể dùng tính năng 'Xuất CSV' tại trang Đơn hàng để có bảng chi tiết đi chợ."
        plannedFeatures={[
          "Tự động tính tổng kg rau củ và thịt cá cần mua theo từng ngày",
          "Phân loại nguyên liệu theo từng nhà cung cấp / vựa chợ đầu mối",
          "Giao diện tích chọn [x] Đã mua ngay trên điện thoại khi đi chợ",
        ]}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Danh sách mua hàng</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tổng hợp nguyên liệu cần mua theo ngày, phân nhóm theo nhà cung cấp
        </p>
      </div>
      <ShoppingListManager />
    </div>
  );
}
