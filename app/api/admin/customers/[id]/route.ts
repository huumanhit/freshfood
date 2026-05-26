import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function adminGuard(s: Awaited<ReturnType<typeof auth>>) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const customer = await db.user.findUnique({
    where: { id: params.id },
    include: {
      addresses: true,
      customerScore: true,
      customerNotes: {
        orderBy: [{ isImportant: "desc" }, { createdAt: "desc" }],
      },
      referrerRewards: {
        select: { id: true, refereePhone: true, rewardAmount: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      orders: {
        select: { id: true, orderNumber: true, status: true, total: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!customer) return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });

  return NextResponse.json({
    customer: {
      ...customer,
      customerScore: customer.customerScore
        ? {
            ...customer.customerScore,
            totalSpent: Number(customer.customerScore.totalSpent),
            avgOrderValue: Number(customer.customerScore.avgOrderValue),
          }
        : null,
      orders: customer.orders.map((o) => ({ ...o, total: Number(o.total) })),
      referrerRewards: customer.referrerRewards.map((r) => ({
        ...r,
        rewardAmount: Number(r.rewardAmount),
      })),
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { isActive } = await req.json();
  const user = await db.user.update({
    where: { id: params.id },
    data: { isActive },
    select: { id: true, isActive: true },
  });
  return NextResponse.json({ user });
}
