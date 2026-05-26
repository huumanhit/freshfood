import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PackingSlipView } from "@/components/admin/packing-slip/PackingSlipView";

export const metadata: Metadata = { title: "Phiếu đóng gói" };
export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default function PackingSlipPage({ params }: Props) {
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
