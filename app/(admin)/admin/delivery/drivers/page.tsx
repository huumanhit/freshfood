import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DriverLocationsPanel } from "@/components/admin/gps/DriverLocationsPanel";

export const metadata: Metadata = { title: "Vị trí tài xế" };
export const dynamic = "force-dynamic";

export default function AdminDriverLocationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/delivery"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Bảng giao hàng
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vị trí tài xế</h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi vị trí GPS của tài xế trong 4 giờ gần nhất
        </p>
      </div>
      <DriverLocationsPanel />
    </div>
  );
}
