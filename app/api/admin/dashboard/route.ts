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

    // Profit via raw SQL — works before and after costPrice column exists
    const totalProfit = await safe(async () => {
      const rows = await db.$queryRaw<{ profit: number }[]>`
        SELECT COALESCE(SUM(
          (oi.price - COALESCE(p."costPrice", 0)) * oi.quantity
        ), 0)::float AS profit
        FROM "order_items" oi
        JOIN "orders" o ON o.id = oi."orderId"
        JOIN "products" p ON p.id = oi."productId"
        WHERE o."paymentStatus" = 'PAID'
      `;
      return Number(rows[0]?.profit ?? 0);
    }, 0);

    const profitThisMonth = await safe(async () => {
      const rows = await db.$queryRaw<{ profit: number }[]>`
        SELECT COALESCE(SUM(
          (oi.price - COALESCE(p."costPrice", 0)) * oi.quantity
        ), 0)::float AS profit
        FROM "order_items" oi
        JOIN "orders" o ON o.id = oi."orderId"
        JOIN "products" p ON p.id = oi."productId"
        WHERE o."paymentStatus" = 'PAID'
          AND o."createdAt" >= ${startThisMonth}
      `;
      return Number(rows[0]?.profit ?? 0);
    }, 0);

    // ── Traffic stats ────────────────────────────────────────────────────────
    const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const todayStr = vnTime.toISOString().slice(0, 10);
    const thisMonthPrefix = todayStr.slice(0, 7);

    const past7DateStrs: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(vnTime.getTime() - i * 24 * 60 * 60 * 1000);
      past7DateStrs.push(d.toISOString().slice(0, 10));
    }

    interface VisitRecord {
      date: string;
      views: number;
      visitors: number;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dailyVisitDb = (db as any).dailyVisit;

    const [todayVisit, allVisits, past7Visits] = await Promise.all([
      safe<VisitRecord | null>(() => dailyVisitDb?.findUnique({ where: { date: todayStr } }), null),
      safe<VisitRecord[]>(() => dailyVisitDb?.findMany({ select: { date: true, views: true, visitors: true } }), []),
      safe<VisitRecord[]>(() => dailyVisitDb?.findMany({ where: { date: { in: past7DateStrs } } }), []),
    ]);

    const totalViews = allVisits.reduce((acc, v) => acc + v.views, 0);
    const totalVisitors = allVisits.reduce((acc, v) => acc + v.visitors, 0);
    const thisMonthViews = allVisits
      .filter((v) => v.date.startsWith(thisMonthPrefix))
      .reduce((acc, v) => acc + v.views, 0);
    const thisMonthVisitors = allVisits
      .filter((v) => v.date.startsWith(thisMonthPrefix))
      .reduce((acc, v) => acc + v.visitors, 0);

    const past7Map = new Map(past7Visits.map((v) => [v.date, v]));
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const last7Days = past7DateStrs.map((dStr) => {
      const item = past7Map.get(dStr);
      const dObj = new Date(dStr + "T00:00:00Z");
      const dayName = dayNames[dObj.getUTCDay()];
      const label = `${dStr.slice(8, 10)}/${dStr.slice(5, 7)}`;
      return {
        date: dStr,
        label,
        dayName,
        views: item?.views ?? 0,
        visitors: item?.visitors ?? 0,
      };
    });

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
          profit: { total: totalProfit, thisMonth: profitThisMonth },
          products: totalProducts,
          customers: { total: totalCustomers, newThisMonth: newCustomersThisMonth },
          traffic: {
            todayViews: todayVisit?.views ?? 0,
            todayVisitors: todayVisit?.visitors ?? 0,
            thisMonthViews,
            thisMonthVisitors,
            totalViews,
            totalVisitors,
          },
        },
        traffic: {
          todayViews: todayVisit?.views ?? 0,
          todayVisitors: todayVisit?.visitors ?? 0,
          thisMonthViews,
          thisMonthVisitors,
          totalViews,
          totalVisitors,
          last7Days,
        },
        topProducts: topProducts.map((p) => ({ ...p, price: Number(p.price) })),
        recentOrders: recentOrders.map((o) => ({ ...o, total: Number(o.total), createdAt: o.createdAt.toISOString() })),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
