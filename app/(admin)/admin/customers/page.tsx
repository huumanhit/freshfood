import type { Metadata } from "next";

export const metadata: Metadata = { title: "Khách hàng" };

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Khách hàng</h1>
      {/* CustomerDataTable — Phase 2 */}
    </div>
  );
}
