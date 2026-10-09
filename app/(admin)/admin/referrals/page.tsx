import type { Metadata } from "next";
import { ReferralsTable } from "@/components/admin/referrals/ReferralsTable";
import { Phase2UnderDevelopment } from "@/components/admin/shared/Phase2UnderDevelopment";

export const metadata: Metadata = { title: "Chương trình giới thiệu" };
export const dynamic = "force-dynamic";

// Chuyển thành true khi khách hàng chốt kích hoạt Phase 2
const ENABLE_PHASE_2 = false;

export default function AdminReferralsPage() {
  if (!ENABLE_PHASE_2) {
    return (
      <Phase2UnderDevelopment
        featureName="Hệ thống giới thiệu khách tự động (Referral)"
        description="Chức năng tự động cộng thưởng credit 20.000đ cho người giới thiệu và người được giới thiệu. Trong Phase 1, SĐT người giới thiệu được ghi nhận trực tiếp trên từng đơn hàng để chủ shop tự áp quà thủ công."
        plannedFeatures={[
          "Tự động sinh mã giới thiệu cá nhân cho từng khách hàng",
          "Tự động cộng 20.000đ vào ví credit khi đơn hàng đầu tiên giao thành công",
          "Cơ chế dùng credit trừ tiền đơn hàng hoặc đổi rau theo hạn mức",
        ]}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chương trình giới thiệu</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý phần thưởng giới thiệu khách hàng mới — 20,000 ₫ / lần thành công
        </p>
      </div>
      <ReferralsTable />
    </div>
  );
}
