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

    // Allow partial patches: status-only, paymentStatus-only, adminNote-only, or combined
    const { status, paymentStatus, adminNote } = body as {
      status?: string;
      paymentStatus?: string;
      adminNote?: string;
    };

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: { user: { select: { phone: true } }, address: { select: { phone: true } } },
    });
    if (!order) throw new NotFoundError("Đơn hàng");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};

    if (status) {
      const { status: validStatus } = updateOrderStatusSchema.parse({ status });
      updateData.status = validStatus;
      if (validStatus === "SHIPPED") updateData.shippedAt = new Date();
      if (validStatus === "DELIVERED") {
        updateData.deliveredAt = new Date();
        if (!order.shippedAt) updateData.shippedAt = new Date();
      }
      if (validStatus === "CANCELLED") updateData.cancelledAt = new Date();
    }

    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (adminNote !== undefined) updateData.adminNote = adminNote || null;

    const updated = await db.order.update({ where: { id: params.id }, data: updateData });

    if (status) {
      const phone = order.user?.phone ?? order.address?.phone;
      notifyOrderStatus(phone, status, order.orderNumber, params.id).catch(() => {});
    }

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
