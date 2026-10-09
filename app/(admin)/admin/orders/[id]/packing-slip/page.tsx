import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PackingSlipView } from "@/components/admin/packing-slip/PackingSlipView";
import { Phase2UnderDevelopment } from "@/components/admin/shared/Phase2UnderDevelopment";

export const metadata: Metadata = { title: "Phiếu đóng gói" };
export const dynamic = "force-dynamic";

// Chuyển thành true khi khách hàng chốt kích hoạt Phase 2
const ENABLE_PHASE_2 = false;

interface Props {
  params: { id: string };
}

export default function PackingSlipPage({ params }: Props) {
  if (!ENABLE_PHASE_2) {
    return (
      <Phase2UnderDevelopment
        featureName="Tự động in phiếu đóng gói (Packing Slip)"
        description="Chức năng tự động sinh và in phiếu đóng gói chuyên dụng dán lên kiện hàng. Thuộc lộ trình nâng cấp Phase 2."
        plannedFeatures={[
          "Mẫu in chuẩn khổ giấy chuyên dụng (kèm mã vạch/QR đơn hàng)",
          "Liệt kê chi tiết từng món hàng kèm đơn vị và ghi chú của khách",
          "Tự động tính tiền thu COD hoặc xác nhận đã thanh toán chuyển khoản",
        ]}
        backUrl={`/admin/orders/${params.id}`}
        backLabel="Quay lại chi tiết đơn hàng"
      />
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/admin/orders/${params.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors no-print"
      >
        <ChevronLeft className="h-4 w-4" /> Quay lại đơn hàng
      </Link>
      <PackingSlipView orderId={params.id} />
    </div>
  );
}
