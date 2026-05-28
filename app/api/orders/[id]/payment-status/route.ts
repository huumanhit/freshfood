import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) {
    return NextResponse.json({ error: "Missing phone" }, { status: 400 });
  }

  const order = await db.order.findFirst({
    where: {
      id: params.id,
      address: { phone },
    },
    select: { paymentStatus: true, orderNumber: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    paymentStatus: order.paymentStatus,
    orderNumber: order.orderNumber,
  });
}
