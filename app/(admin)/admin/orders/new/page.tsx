import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminCreateOrderForm } from "@/components/admin/orders/AdminCreateOrderForm";
import { ROUTES } from "@/constants/routes";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tạo đơn thủ công" };

export default function AdminCreateOrderPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <Link
          href={ROUTES.ADMIN_ORDERS}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#22c55e] transition-colors mb-2"
        >
          <ChevronLeft className="h-4 w-4" /> Danh sách đơn hàng
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tạo đơn thủ công</h1>
        <p className="text-sm text-gray-500 mt-0.5">Nhập đơn gọi thêm buổi tối hoặc sửa đơn nhầm</p>
      </div>
      <AdminCreateOrderForm />
    </div>
  );
}
