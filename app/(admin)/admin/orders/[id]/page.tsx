import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chi tiết đơn hàng" };

interface AdminOrderDetailPageProps {
  params: { id: string };
}

export default function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đơn hàng #{params.id}</h1>
      {/* OrderDetailView + StatusTimeline — Phase 2 */}
    </div>
  );
}
