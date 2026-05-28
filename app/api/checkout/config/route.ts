export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_CUTOFF, DEFAULT_AFTER_HOURS } from "@/lib/business/ordering";

export async function GET() {
  const [cutoffSetting, afterHoursSetting] = await Promise.all([
    db.setting.findUnique({ where: { key: "order_cutoff" } }).catch(() => null),
    db.setting.findUnique({ where: { key: "after_hours_cutoff" } }).catch(() => null),
  ]);
  return NextResponse.json({
    cutoff: cutoffSetting?.value ?? DEFAULT_CUTOFF,
    afterHoursCutoff: afterHoursSetting?.value ?? DEFAULT_AFTER_HOURS,
  });
}
