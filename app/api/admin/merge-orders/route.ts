import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function adminGuard(session: Session | null) {
  return session?.user && (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN");
}

// Detect orders that can be merged (same phone + deliverySlot, within same day, in CONFIRMED/PROCESSING)
export async function GET() {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const orders = await db.order.findMany({
    where: {
      status: { in: ["CONFIRMED", "PROCESSING"] },
      mergeGroupId: null,
    },
    include: {
      user: { select: { id: true, name: true, phone: true } },
      address: { select: { fullName: true, phone: true } },
      items: { select: { productName: true, quantity: true, price: true, subtotal: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by (phone, date YYYY-MM-DD, deliverySlot)
  const groups = new Map<string, typeof orders>();
  for (const order of orders) {
    const phone = order.user?.phone ?? order.address?.phone ?? "";
    if (!phone) continue;
    const date = order.createdAt.toISOString().split("T")[0];
    const slot = order.deliverySlot ?? "none";
    const key = `${phone}||${date}||${slot}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(order);
  }

  const candidates = Array.from(groups.entries())
    .filter(([, orders]) => orders.length >= 2)
    .map(([key, orders]) => {
      const [phone, date, slot] = key.split("||");
      return {
        key,
        phone,
        date,
        slot: slot === "none" ? null : slot,
        orderCount: orders.length,
        totalItems: orders.reduce((s, o) => s + o.items.length, 0),
        combinedTotal: orders.reduce((s, o) => s + Number(o.total), 0),
        orders: orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          total: Number(o.total),
          itemCount: o.items.length,
          items: o.items.map((i) => ({ ...i, price: Number(i.price), subtotal: Number(i.subtotal) })),
          customerName: o.user?.name ?? o.address?.fullName ?? "Khách hàng",
        })),
      };
    });

  // Also return active merge groups
  const activeGroups = await db.mergeGroup.findMany({
    where: { status: "PENDING" },
    include: { orders: { select: { id: true, orderNumber: true, total: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ candidates, activeGroups });
}

// Create a merge group from detected candidates
export async function POST(req: Request) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { orderIds, phone, date, slot } = await req.json();
  if (!Array.isArray(orderIds) || orderIds.length < 2) {
    return NextResponse.json({ error: "Cần ít nhất 2 đơn hàng" }, { status: 400 });
  }

  const group = await db.mergeGroup.create({
    data: {
      phone,
      date,
      slot: slot ?? null,
      orders: { connect: orderIds.map((id: string) => ({ id })) },
    },
  });

  return NextResponse.json({ group }, { status: 201 });
}
