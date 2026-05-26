import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const DELIVERY_SELECT = {
  id: true,
  orderNumber: true,
  status: true,
  paymentMethod: true,
  total: true,
  note: true,
  deliverySlot: true,
  createdAt: true,
  shippedAt: true,
  deliveredAt: true,
  failedAt: true,
  user: { select: { name: true, phone: true } },
  address: {
    select: {
      fullName: true,
      phone: true,
      street: true,
      ward: true,
      district: true,
      province: true,
    },
  },
  items: {
    select: { productName: true, quantity: true, price: true },
  },
} as const;

const RECENT_DAYS = 7;
const recentCutoff = () => {
  const d = new Date();
  d.setDate(d.getDate() - RECENT_DAYS);
  return d;
};

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cutoff = recentCutoff();

  const [pending, shipping, delivered, failed] = await Promise.all([
    db.order.findMany({
      where: { status: { in: ["CONFIRMED", "PROCESSING"] } },
      select: DELIVERY_SELECT,
      orderBy: { createdAt: "asc" },
    }),
    db.order.findMany({
      where: { status: "SHIPPED" },
      select: DELIVERY_SELECT,
      orderBy: { shippedAt: "asc" },
    }),
    db.order.findMany({
      where: { status: "DELIVERED", deliveredAt: { gte: cutoff } },
      select: DELIVERY_SELECT,
      orderBy: { deliveredAt: "desc" },
      take: 50,
    }),
    db.order.findMany({
      where: { status: "FAILED", failedAt: { gte: cutoff } },
      select: DELIVERY_SELECT,
      orderBy: { failedAt: "desc" },
      take: 50,
    }),
  ]);

  const toNum = (orders: typeof pending) =>
    orders.map((o) => ({ ...o, total: Number(o.total) }));

  return NextResponse.json({
    pending: toNum(pending),
    shipping: toNum(shipping),
    delivered: toNum(delivered),
    failed: toNum(failed),
  });
}
