import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function adminGuard(s: Session | null) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

const REWARD_AMOUNT = 20_000; // 20,000 VND per successful referral

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action } = await req.json();

  if (action === "confirm") {
    const reward = await db.referralReward.update({
      where: { id: params.id },
      data: { status: "CONFIRMED" },
    });
    return NextResponse.json({ reward: { ...reward, rewardAmount: Number(reward.rewardAmount) } });
  }

  if (action === "apply") {
    // Create a coupon for the referrer with the reward amount
    const reward = await db.referralReward.findUnique({
      where: { id: params.id },
      include: { referrer: { select: { id: true, name: true } } },
    });
    if (!reward || reward.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Phần thưởng không hợp lệ" }, { status: 422 });
    }

    const couponCode = `REF-${reward.referrerId.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.$transaction([
      db.coupon.create({
        data: {
          code: couponCode,
          type: "FIXED_AMOUNT",
          value: REWARD_AMOUNT,
          usageLimit: 1,
          isActive: true,
          expiresAt,
        },
      }),
      db.referralReward.update({
        where: { id: params.id },
        data: { status: "APPLIED", appliedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ couponCode });
  }

  if (action === "cancel") {
    await db.referralReward.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Action không hợp lệ" }, { status: 400 });
}
