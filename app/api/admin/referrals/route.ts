import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function adminGuard(s: Session | null) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

// GET /api/admin/referrals — list all referral rewards
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status") ?? "";
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? "1"));
  const limit = 20;

  const where = status ? { status: status as never } : {};

  const [rewards, total] = await Promise.all([
    db.referralReward.findMany({
      where,
      include: {
        referrer: { select: { id: true, name: true, phone: true, email: true } },
        referee: { select: { id: true, name: true, phone: true, email: true } },
        order: { select: { id: true, orderNumber: true, total: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    db.referralReward.count({ where }),
  ]);

  return NextResponse.json({
    rewards: rewards.map((r) => ({
      ...r,
      rewardAmount: Number(r.rewardAmount),
      order: r.order ? { ...r.order, total: Number(r.order.total) } : null,
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
  });
}
