export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/api-error";
import { updateOrderStatusSchema } from "@/lib/validations/order";
import { notifyOrderStatus } from "@/lib/zalo-zns";

interface RouteParams {
  params: { id: string };
}

function requireAdmin(role: string) {
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") throw new ForbiddenError();
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
        items: {
          include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
        },
        coupon: { select: { code: true, type: true, value: true } },
      },
    });

    if (!order) throw new NotFoundError("Đơn hàng");
    return successResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const body = await req.json();
    const { status } = updateOrderStatusSchema.parse(body);

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: { user: { select: { phone: true } }, address: { select: { phone: true } } },
    });
    if (!order) throw new NotFoundError("Đơn hàng");

    const timestamps: Record<string, Date | null> = {};
    if (status === "SHIPPED") timestamps.shippedAt = new Date();
    if (status === "DELIVERED") {
      timestamps.deliveredAt = new Date();
      timestamps.shippedAt = order.shippedAt ?? new Date();
    }
    if (status === "CANCELLED") timestamps.cancelledAt = new Date();

    const updated = await db.order.update({
      where: { id: params.id },
      data: { status, ...timestamps },
    });

    const phone = order.user?.phone ?? order.address?.phone;
    notifyOrderStatus(phone, status, order.orderNumber, params.id).catch(() => {});

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
