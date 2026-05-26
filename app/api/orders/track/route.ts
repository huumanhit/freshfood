export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse } from "@/lib/api-response";
import { handleApiError, AppError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get("phone")?.trim();
    if (!phone) throw new AppError("Vui lòng nhập số điện thoại", 400);

    const user = await db.user.findFirst({ where: { phone } });
    if (!user) {
      return successResponse([], "Không tìm thấy đơn hàng");
    }

    const orders = await db.order.findMany({
      where: { userId: user.id },
      include: {
        items: { select: { productName: true, quantity: true, price: true, subtotal: true } },
        address: { select: { fullName: true, phone: true, street: true, district: true, province: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const result = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      total: Number(o.total),
      subtotal: Number(o.subtotal),
      shippingFee: Number(o.shippingFee),
      discount: Number(o.discount),
      createdAt: o.createdAt.toISOString(),
      deliveredAt: o.deliveredAt?.toISOString() ?? null,
      address: o.address,
      items: o.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        price: Number(i.price),
        subtotal: Number(i.subtotal),
      })),
    }));

    return successResponse(result, "OK");
  } catch (error) {
    return handleApiError(error);
  }
}
