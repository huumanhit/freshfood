export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_CUTOFF, DEFAULT_AFTER_HOURS } from "@/lib/business/ordering";
import { DELIVERY_SLOTS } from "@/lib/validations/order";

export async function GET() {
  const [cutoffSetting, afterHoursSetting, slotsSetting] = await Promise.all([
    db.setting.findUnique({ where: { key: "order_cutoff" } }).catch(() => null),
    db.setting.findUnique({ where: { key: "after_hours_cutoff" } }).catch(() => null),
    db.setting.findUnique({ where: { key: "delivery_slots" } }).catch(() => null),
  ]);

  // Parse delivery slots from DB, fallback to hardcoded constant
  let deliverySlots: { value: string; label: string }[] = [...DELIVERY_SLOTS];
  if (slotsSetting?.value) {
    try {
      const parsed = JSON.parse(slotsSetting.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        deliverySlots = parsed;
      }
    } catch {
      // malformed JSON — keep default
    }
  }

  return NextResponse.json({
    cutoff: cutoffSetting?.value ?? DEFAULT_CUTOFF,
    afterHoursCutoff: afterHoursSetting?.value ?? DEFAULT_AFTER_HOURS,
    deliverySlots,
  });
}
