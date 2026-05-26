export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ count: 0 });
    const role = (session.user as { role?: string })?.role ?? "";
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") return NextResponse.json({ count: 0 });

    const count = await db.order.count({ where: { status: "PENDING" } });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
