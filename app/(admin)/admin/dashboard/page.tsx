import type { Metadata } from "next";
import { db } from "@/lib/db";
import { startOfDay, startOfMonth, subMonths } from "date-fns";
import { StatsCards } from "@/components/admin/dashboard/StatsCards";
import { RecentOrdersTable } from "@/components/admin/dashboard/RecentOrdersTable";
import { TopProductsTable } from "@/components/admin/dashboard/TopProductsTable";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const now = new Date();
  const startThisMonth = startOfMonth(now);
  const startLastMonth = startOfMonth(subMonths(now, 1));
  const startToday = startOfDay(now);

  const [
    totalOrders,
    pendingOrders,
    todayOrders,
    totalRevenue,
    revenueThisMonth,
    revenueLastMonth,
    totalProducts,
    totalCustomers,
    newCustomersThisMonth,
    topProducts,
    recentOrders,
  ] = await Promise.all([
    db.order.count({ where: { status: { not: "CANCELLED" } } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { createdAt: { gte: startToday } } }),
    db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID", createdAt: { gte: startThisMonth } } }),
    db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID", createdAt: { gte: startLastMonth, lt: startThisMonth } } }),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.user.count({ where: { role: "USER" } }),
    db.user.count({ where: { role: "USER", createdAt: { gte: startThisMonth } } }),
    db.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { soldCount: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        soldCount: true,
        price: true,
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      },
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentMethod: true,
        total: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const stats = {
    orders: { total: totalOrders, pending: pendingOrders, today: todayOrders },
    revenue: {
      total: Number(totalRevenue._sum.total ?? 0),
      thisMonth: Number(revenueThisMonth._sum.total ?? 0),
      lastMonth: Number(revenueLastMonth._sum.total ?? 0),
    },
    products: totalProducts,
    customers: { total: totalCustomers, newThisMonth: newCustomersThisMonth },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tổng quan hoạt động cửa hàng</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentOrdersTable
            orders={recentOrders.map((o) => ({
              ...o,
              total: Number(o.total),
            }))}
          />
        </div>
        <div>
          <TopProductsTable
            products={topProducts.map((p) => ({
              ...p,
              price: Number(p.price),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
