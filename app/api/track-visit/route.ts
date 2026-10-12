export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const isNewVisitor = Boolean(body?.isNewVisitor);

    // Vietnam timezone date (UTC+7)
    const now = new Date();
    const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const today = vnTime.toISOString().slice(0, 10); // "YYYY-MM-DD"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dailyVisitDb = (db as any).dailyVisit;

    await dailyVisitDb.upsert({
      where: { date: today },
      update: {
        views: { increment: 1 },
        ...(isNewVisitor ? { visitors: { increment: 1 } } : {}),
      },
      create: {
        date: today,
        views: 1,
        visitors: isNewVisitor ? 1 : 1,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) });
  }
}
