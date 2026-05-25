import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {/* StatsCards — Phase 2 */}
      {/* RevenueChart — Phase 2 */}
      {/* RecentOrders — Phase 2 */}
      {/* TopProducts — Phase 2 */}
    </div>
  );
}
