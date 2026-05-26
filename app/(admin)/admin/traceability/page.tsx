import type { Metadata } from "next";
import { TraceabilityManager } from "@/components/admin/traceability/TraceabilityManager";

export const metadata: Metadata = { title: "Truy xuất nguồn gốc" };
export const dynamic = "force-dynamic";

export default function AdminTraceabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Truy xuất nguồn gốc</h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi lô hàng từ nhà cung cấp đến tay khách hàng với nhật ký sự kiện đầy đủ
        </p>
      </div>
      <TraceabilityManager />
    </div>
  );
}
