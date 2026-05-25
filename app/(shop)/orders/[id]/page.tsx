import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chi tiết đơn hàng" };

interface OrderDetailPageProps {
  params: { id: string };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return (
    <div className="container py-8">
      {/* OrderDetail — Phase 2 */}
    </div>
  );
}
