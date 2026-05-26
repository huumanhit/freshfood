import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function adminGuard(s: Awaited<ReturnType<typeof auth>>) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

// GET /api/admin/shopping-list?date=YYYY-MM-DD (optional)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const date = req.nextUrl.searchParams.get("date");
  if (date) {
    const list = await db.shoppingList.findUnique({
      where: { date },
      include: { items: { include: { supplier: true, product: { select: { name: true, unit: true } } } } },
    });
    return NextResponse.json({ list });
  }

  const lists = await db.shoppingList.findMany({
    orderBy: { date: "desc" },
    take: 30,
    include: { _count: { select: { items: true } } },
  });
  return NextResponse.json({ lists });
}

// POST /api/admin/shopping-list — generate for a date
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { date } = await req.json();
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Ngày không hợp lệ (YYYY-MM-DD)" }, { status: 400 });
  }

  // Get all CONFIRMED/PROCESSING orders on this date
  const startOfDay = new Date(date);
  const endOfDay = new Date(date);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const orders = await db.order.findMany({
    where: {
      status: { in: ["CONFIRMED", "PROCESSING"] },
      createdAt: { gte: startOfDay, lt: endOfDay },
    },
    include: {
      items: {
        include: { product: { select: { id: true, name: true, unit: true, supplierId: true } } },
      },
    },
  });

  // Aggregate by product
  const productMap = new Map<string, {
    productId: string;
    productName: string;
    unit: string;
    quantity: number;
    supplierId: string | null;
  }>();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: item.product.name,
          unit: item.product.unit,
          quantity: item.quantity,
          supplierId: item.product.supplierId,
        });
      }
    }
  }

  if (productMap.size === 0) {
    return NextResponse.json({ error: "Không có đơn hàng nào cho ngày này" }, { status: 404 });
  }

  // Upsert shopping list for the date
  const list = await db.shoppingList.upsert({
    where: { date },
    create: {
      date,
      status: "DRAFT",
      items: {
        create: Array.from(productMap.values()).map((p) => ({
          productId: p.productId,
          productName: p.productName,
          unit: p.unit,
          quantity: p.quantity,
          supplierId: p.supplierId,
        })),
      },
    },
    update: {
      status: "DRAFT",
      items: {
        deleteMany: {},
        create: Array.from(productMap.values()).map((p) => ({
          productId: p.productId,
          productName: p.productName,
          unit: p.unit,
          quantity: p.quantity,
          supplierId: p.supplierId,
        })),
      },
    },
    include: { items: { include: { supplier: true } } },
  });

  return NextResponse.json({ list }, { status: 201 });
}
