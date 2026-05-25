import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, ForbiddenError } from "@/lib/api-error";
import { startOfDay, startOfMonth, subDays, subMonths } from "date-fns";

function requireAdmin(role: string) {
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") throw new ForbiddenError();
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const now = new Date();
    const startThisMonth = startOfMonth(now);
    const startLastMonth = startOfMonth(subMonths(now, 1));
    const startToday = startOfDay(now);
    const start7Days = subDays(startToday, 7);

    const [
      totalOrders,
      pendingOrders,
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
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID" },
      }),
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID", createdAt: { gte: startThisMonth } },
      }),
      db.order.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: startLastMonth, lt: startThisMonth },
        },
      }),
      db.product.count({ where: { status: "ACTIVE" } }),
      db.user.count({ where: { role: "USER" } }),
      db.user.count({
        where: { role: "USER", createdAt: { gte: startThisMonth } },
      }),
      db.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { soldCount: "desc" },
        take: 5,
        include: { images: { where: { isPrimary: true }, take: 1 } },
        select: {
          id: true,
          name: true,
          soldCount: true,
          price: true,
          images: true,
        },
      }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    return successResponse({
      orders: { total: totalOrders, pending: pendingOrders },
      revenue: {
        total: Number(totalRevenue._sum.total ?? 0),
        thisMonth: Number(revenueThisMonth._sum.total ?? 0),
        lastMonth: Number(revenueLastMonth._sum.total ?? 0),
      },
      products: totalProducts,
      customers: { total: totalCustomers, newThisMonth: newCustomersThisMonth },
      topProducts,
      recentOrders,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
