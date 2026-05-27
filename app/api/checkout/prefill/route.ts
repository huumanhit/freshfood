export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const rawPhone = req.nextUrl.searchParams.get("phone") ?? "";
  const phone = rawPhone.replace(/\D/g, "");
  if (phone.length < 9) return NextResponse.json({ found: false });

  const lastOrder = await db.order.findFirst({
    where: { address: { phone: { contains: phone } } },
    orderBy: { createdAt: "desc" },
    select: {
      address: {
        select: { fullName: true, province: true, district: true, ward: true, street: true },
      },
    },
  });

  if (!lastOrder?.address) return NextResponse.json({ found: false });
  return NextResponse.json({ found: true, address: lastOrder.address });
}
