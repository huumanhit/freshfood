import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyOrderStatus } from "@/lib/zalo-zns";

export async function POST(req: NextRequest) {
  // Validate Sepay API key
  const apiKey = req.headers.get("Authorization");
  const expected = `Apikey ${process.env.SEPAY_WEBHOOK_SECRET}`;
  if (!process.env.SEPAY_WEBHOOK_SECRET || apiKey !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const content = String(body.content ?? body.transferContent ?? "");
  const transactionId = String(body.id ?? body.referenceCode ?? body.transaction_id ?? "");

  // Match transfer content: TUOINGON FF-XXXXXXXX-XXXX
  const match = content.match(/TUOINGON\s+(FF-[A-Z0-9]+-[A-Z0-9]+)/i);
  if (!match) {
    // Not a FreshFood order — ignore gracefully
    return NextResponse.json({ success: true, message: "Not a FreshFood order" });
  }

  const orderNumber = match[1].toUpperCase();

  const order = await db.order.findFirst({
    where: { orderNumber },
    select: {
      id: true,
      paymentStatus: true,
      orderNumber: true,
      user: { select: { phone: true } },
      address: { select: { phone: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ success: true, message: "Already paid" });
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
      ...(transactionId && { transactionId }),
    },
  });

  // Fire-and-forget Zalo ZNS notification
  const phone = order.user?.phone ?? order.address?.phone;
  notifyOrderStatus(phone, "CONFIRMED", order.orderNumber, order.id).catch(() => {});

  return NextResponse.json({ success: true });
}
