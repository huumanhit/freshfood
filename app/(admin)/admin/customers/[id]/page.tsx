import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CustomerCRMDetail } from "@/components/admin/crm/CustomerCRMDetail";

export const metadata: Metadata = { title: "Chi tiết khách hàng" };
export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default function AdminCustomerDetailPage({ params }: Props) {
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
