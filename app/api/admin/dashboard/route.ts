export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startOfDay, startOfMonth, subMonths } from "date-fns";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export async function GET() {
  try {
    const now = new Date();
    const startThisMonth = startOfMonth(now);
    const startLastMonth = startOfMonth(subMonths(now, 1));
    const startToday = startOfDay(now);

    const [
      totalOrders, pendingOrders, todayOrders,
      totalRevenue, revenueThisMonth, revenueLastMonth,
      totalProducts, totalCustomers, newCustomersThisMonth,
      topProducts, recentOrders,
    ] = await Promise.all([
      safe(() => db.order.count({ where: { status: { not: "CANCELLED" } } }), 0),
      safe(() => db.order.count({ where: { status: "PENDING" } }), 0),
      safe(() => db.order.count({ where: { createdAt: { gte: startToday } } }), 0),
      safe(() => db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }), { _sum: { total: null } }),
      safe(() => db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID", createdAt: { gte: startThisMonth } } }), { _sum: { total: null } }),
      safe(() => db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID", createdAt: { gte: startLastMonth, lt: startThisMonth } } }), { _sum: { total: null } }),
      safe(() => db.product.count({ where: { status: "ACTIVE" } }), 0),
      safe(() => db.user.count({ where: { role: "USER" } }), 0),
      safe(() => db.user.count({ where: { role: "USER", createdAt: { gte: startThisMonth } } }), 0),
      safe(() => db.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { soldCount: "desc" },
        take: 5,
        select: { id: true, name: true, soldCount: true, price: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } },
      }), []),
      safe(() => db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, orderNumber: true, status: true, paymentMethod: true, total: true, createdAt: true, user: { select: { name: true, email: true } } },
      }), []),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          orders: { total: totalOrders, pending: pendingOrders, today: todayOrders },
          revenue: {
            total: Number(totalRevenue._sum.total ?? 0),
            thisMonth: Number(revenueThisMonth._sum.total ?? 0),
            lastMonth: Number(revenueLastMonth._sum.total ?? 0),
          },
          products: totalProducts,
          customers: { total: totalCustomers, newThisMonth: newCustomersThisMonth },
        },
        topProducts: topProducts.map((p) => ({ ...p, price: Number(p.price) })),
        recentOrders: recentOrders.map((o) => ({ ...o, total: Number(o.total), createdAt: o.createdAt.toISOString() })),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
