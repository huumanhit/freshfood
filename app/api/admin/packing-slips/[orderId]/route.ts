import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function adminGuard(s: Awaited<ReturnType<typeof auth>>) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

export async function GET(
  _req: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const order = await db.order.findUnique({
    where: { id: params.orderId },
    include: {
      user: { select: { name: true, phone: true, email: true } },
      address: true,
      items: {
        include: {
          product: { select: { id: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } } },
        },
      },
      coupon: { select: { code: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });

  // Mark as printed
  await db.order.update({ where: { id: params.orderId }, data: { packingSlipPrinted: true } });

  const slip = {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    status: order.status,
    paymentMethod: order.paymentMethod,
    deliverySlot: order.deliverySlot,
    note: order.note,
    customer: {
      name: order.user?.name ?? order.address?.fullName ?? "Khách hàng",
      phone: order.user?.phone ?? order.address?.phone ?? "",
      email: order.user?.email ?? "",
    },
    address: order.address
      ? `${order.address.street}, ${order.address.ward}, ${order.address.district}, ${order.address.province}`
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      image: item.product?.images[0]?.url ?? item.productImage ?? null,
      price: Number(item.price),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
    })),
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shippingFee),
    discount: Number(order.discount),
    couponCode: order.coupon?.code ?? null,
    total: Number(order.total),
  };

  return NextResponse.json({ slip });
}
