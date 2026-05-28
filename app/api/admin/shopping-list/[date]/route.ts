import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function adminGuard(s: Session | null) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

// PATCH /api/admin/shopping-list/[date] — update status or item purchased state
export async function PATCH(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  if ("status" in body) {
    const list = await db.shoppingList.update({
      where: { date: params.date },
      data: { status: body.status },
    });
    return NextResponse.json({ list });
  }

  if ("itemId" in body && "isPurchased" in body) {
    const item = await db.shoppingListItem.update({
      where: { id: body.itemId },
      data: { isPurchased: body.isPurchased },
    });
    return NextResponse.json({ item });
  }

  return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
}
