import type { Metadata } from "next";
import { ReferralsTable } from "@/components/admin/referrals/ReferralsTable";

export const metadata: Metadata = { title: "Chương trình giới thiệu" };
export const dynamic = "force-dynamic";

export default function AdminReferralsPage() {
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
