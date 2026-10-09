import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CustomerCRMDetail } from "@/components/admin/crm/CustomerCRMDetail";
import { Phase2UnderDevelopment } from "@/components/admin/shared/Phase2UnderDevelopment";

export const metadata: Metadata = { title: "Chi tiết khách hàng" };
export const dynamic = "force-dynamic";

// Đã kích hoạt cho chạy theo yêu cầu
const ENABLE_PHASE_2 = true;

interface Props {
  params: { id: string };
}

export default function AdminCustomerDetailPage({ params }: Props) {
  if (!ENABLE_PHASE_2) {
    return (
      <Phase2UnderDevelopment
        featureName="Hồ sơ khách hàng CRM chi tiết"
        description="Chức năng xem phân tích hành vi mua sắm, chấm điểm rủi ro và quản trị ghi chú khách hàng chuyên sâu. Thuộc lộ trình nâng cấp Phase 2."
        plannedFeatures={[
          "Lịch sử chi tiêu và tần suất đặt hàng của khách",
          "Gắn nhãn phân khúc khách VIP / Khách thân thiết",
          "Ghi chú nội bộ cho nhân viên chăm sóc khách hàng",
        ]}
        backUrl="/admin/orders"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/customers"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Danh sách khách hàng
        </Link>
      </div>
      <CustomerCRMDetail customerId={params.id} />
    </div>
  );
}
