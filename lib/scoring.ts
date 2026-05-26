import { db } from "@/lib/db";

export interface ScoreResult {
  orderCount: number;
  totalSpent: number;
  avgOrderValue: number;
  noShowCount: number;
  cancelCount: number;
  score: number;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  riskFlags: string[];
  lastOrderAt: Date | null;
}

function computeTier(score: number): "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" {
  if (score >= 76) return "PLATINUM";
  if (score >= 51) return "GOLD";
  if (score >= 31) return "SILVER";
  return "BRONZE";
}

export async function computeCustomerScore(userId: string): Promise<ScoreResult> {
  const orders = await db.order.findMany({
    where: { userId },
    select: { status: true, total: true, createdAt: true, paymentMethod: true },
    orderBy: { createdAt: "desc" },
  });

  const completed = orders.filter((o) => o.status === "DELIVERED");
  const cancelled = orders.filter((o) => o.status === "CANCELLED");
  const failed = orders.filter((o) => o.status === "FAILED");

  const orderCount = completed.length;
  const totalSpent = completed.reduce((s, o) => s + Number(o.total), 0);
  const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
  const noShowCount = failed.length;
  const cancelCount = cancelled.length;
  const lastOrderAt = orders[0]?.createdAt ?? null;

  // Score calculation
  let score = 50;
  score += Math.min(orderCount * 3, 30);
  score += Math.min(Math.floor(totalSpent / 500000), 20);
  score -= noShowCount * 15;
  score -= cancelCount * 5;
  score = Math.max(0, Math.min(100, score));

  // Risk flags
  const riskFlags: string[] = [];
  if (noShowCount >= 2) riskFlags.push("REPEATED_NO_SHOW");
  if (cancelCount >= 3) riskFlags.push("HIGH_CANCEL_RATE");
  if (cancelCount > orderCount && orderCount > 0) riskFlags.push("CANCEL_EXCEEDS_ORDERS");

  const tier = computeTier(score);

  return {
    orderCount,
    totalSpent,
    avgOrderValue,
    noShowCount,
    cancelCount,
    score,
    tier,
    riskFlags,
    lastOrderAt,
  };
}

export async function upsertCustomerScore(userId: string): Promise<ScoreResult> {
  const result = await computeCustomerScore(userId);

  await db.customerScore.upsert({
    where: { userId },
    create: {
      userId,
      orderCount: result.orderCount,
      totalSpent: result.totalSpent,
      avgOrderValue: result.avgOrderValue,
      noShowCount: result.noShowCount,
      cancelCount: result.cancelCount,
      score: result.score,
      tier: result.tier,
      riskFlags: result.riskFlags.length ? JSON.stringify(result.riskFlags) : null,
      lastOrderAt: result.lastOrderAt,
      computedAt: new Date(),
    },
    update: {
      orderCount: result.orderCount,
      totalSpent: result.totalSpent,
      avgOrderValue: result.avgOrderValue,
      noShowCount: result.noShowCount,
      cancelCount: result.cancelCount,
      score: result.score,
      tier: result.tier,
      riskFlags: result.riskFlags.length ? JSON.stringify(result.riskFlags) : null,
      lastOrderAt: result.lastOrderAt,
      computedAt: new Date(),
    },
  });

  // Sync tier to User.segment
  await db.user.update({
    where: { id: userId },
    data: { segment: result.tier },
  });

  return result;
}
