import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mã giảm giá" };

export default function AdminCouponsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mã giảm giá</h1>
      {/* CouponDataTable — Phase 2 */}
    </div>
  );
}
