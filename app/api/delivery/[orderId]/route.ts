import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { notifyOrderStatus } from "@/lib/zalo-zns";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.enum(["SHIPPED", "DELIVERED", "FAILED"]),
  codCollected: z.boolean().optional(),
  notes: z.string().max(500).optional(),
  failReason: z.string().max(200).optional(),
});

const VALID_TRANSITIONS: Record<string, string[]> = {
  CONFIRMED: ["SHIPPED"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED", "FAILED"],
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { status, codCollected, notes, failReason } = parsed.data;

  const order = await db.order.findUnique({
    where: { id: params.orderId },
    select: {
      id: true,
      status: true,
      orderNumber: true,
      user: { select: { phone: true } },
      address: { select: { phone: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
  }

  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Không thể chuyển từ ${order.status} sang ${status}` },
      { status: 422 }
    );
  }

  const now = new Date();
  const timestampField =
    status === "SHIPPED" ? { shippedAt: now } :
    status === "DELIVERED" ? { deliveredAt: now } :
    { failedAt: now };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db_ = db as any;
  const [updatedOrder] = await db.$transaction([
    db.order.update({
      where: { id: params.orderId },
      data: { status: status as never, ...timestampField },
    }),
    db_.deliveryLog.create({
      data: {
        orderId: params.orderId,
        status,
        codCollected: codCollected ?? false,
        notes: notes ?? null,
        failReason: failReason ?? null,
        createdById: session.user.id,
      },
    }),
  ]);

  // Fire-and-forget Zalo ZNS notification
  const phone = order.user?.phone ?? order.address?.phone;
  notifyOrderStatus(phone, status, order.orderNumber, params.orderId).catch(() => {});

  return NextResponse.json({ order: updatedOrder });
}
