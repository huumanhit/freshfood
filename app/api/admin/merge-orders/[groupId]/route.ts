import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function adminGuard(session: Awaited<ReturnType<typeof auth>>) {
  return session?.user && (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN");
}

const FREE_SHIPPING_THRESHOLD = 120_000;
const SHIPPING_FEE = 15_000;

// PATCH: confirm or reject merge
export async function PATCH(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action } = await req.json();

  if (action === "reject") {
    await db.mergeGroup.update({
      where: { id: params.groupId },
      data: { status: "REJECTED", orders: { set: [] } },
    });
    return NextResponse.json({ ok: true });
  }

  if (action !== "confirm") {
    return NextResponse.json({ error: "Action không hợp lệ" }, { status: 400 });
  }

  // Load all orders in this group
  const group = await db.mergeGroup.findUnique({
    where: { id: params.groupId },
    include: {
      orders: {
        include: {
          items: true,
          coupon: { select: { code: true, type: true, value: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!group || group.status !== "PENDING") {
    return NextResponse.json({ error: "Merge group không hợp lệ" }, { status: 422 });
  }

  if (group.orders.length < 2) {
    return NextResponse.json({ error: "Cần ít nhất 2 đơn hàng" }, { status: 422 });
  }

  const [primaryOrder, ...secondaryOrders] = group.orders;

  // Merge items: consolidate by productId
  const itemMap = new Map<string, { quantity: number; subtotal: number; item: typeof primaryOrder.items[0] }>();
  for (const order of group.orders) {
    for (const item of order.items) {
      const existing = itemMap.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.subtotal += Number(item.subtotal);
      } else {
        itemMap.set(item.productId, {
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
          item,
        });
      }
    }
  }

  const mergedSubtotal = Array.from(itemMap.values()).reduce((s, v) => s + v.subtotal, 0);
  const mergedShipping = mergedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  // Use the highest discount among orders
  const maxDiscount = Math.max(...group.orders.map((o) => Number(o.discount)));
  const mergedTotal = mergedSubtotal + mergedShipping - maxDiscount;

  await db.$transaction(async (tx) => {
    // Delete all items from primary order
    await tx.orderItem.deleteMany({ where: { orderId: primaryOrder.id } });

    // Recreate merged items on primary order
    for (const { quantity, subtotal, item } of itemMap.values()) {
      await tx.orderItem.create({
        data: {
          orderId: primaryOrder.id,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          price: item.price,
          quantity,
          subtotal,
        },
      });
    }

    // Update primary order totals
    await tx.order.update({
      where: { id: primaryOrder.id },
      data: {
        subtotal: mergedSubtotal,
        shippingFee: mergedShipping,
        discount: maxDiscount,
        total: mergedTotal,
        isMergeParent: true,
        packingSlipPrinted: false,
      },
    });

    // Cancel secondary orders
    const now = new Date();
    for (const order of secondaryOrders) {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          cancelledAt: now,
          note: `[Đã gộp vào đơn #${primaryOrder.orderNumber}]${order.note ? ` — ${order.note}` : ""}`,
        },
      });
    }

    // Mark group as confirmed
    await tx.mergeGroup.update({
      where: { id: params.groupId },
      data: { status: "CONFIRMED" },
    });
  });

  return NextResponse.json({ primaryOrderId: primaryOrder.id });
}
