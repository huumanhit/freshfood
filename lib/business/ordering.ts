import { DELIVERY_SLOTS } from "@/lib/validations/order";

export const ORDER_CUTOFF_HOUR = 21; // 21:00 — orders after this shift to next-day delivery

// Slots available only before cutoff (afternoon/evening slots)
const AFTERNOON_SLOT_START_HOURS = [16, 17, 18, 19];

export function isAfterCutoff(nowHour?: number): boolean {
  const h = nowHour ?? new Date().getHours();
  return h >= ORDER_CUTOFF_HOUR;
}

/** Returns the delivery date string (YYYY-MM-DD) for a new order placed right now. */
export function getDeliveryDate(): string {
  const d = new Date();
  if (isAfterCutoff(d.getHours())) {
    d.setDate(d.getDate() + 1);
  }
  return d.toISOString().slice(0, 10);
}

/**
 * Returns which slots are available at `nowHour`.
 * After cutoff, afternoon/evening slots are hidden (can't select same-day
 * afternoon when ordering after 21:00 for next-day morning delivery).
 */
export function getAvailableSlots(nowHour?: number) {
  const h = nowHour ?? new Date().getHours();
  const afterCutoff = h >= ORDER_CUTOFF_HOUR;
  return DELIVERY_SLOTS.map((slot) => {
    const slotHour = parseInt(slot.value.split(":")[0], 10);
    const isAfternoon = AFTERNOON_SLOT_START_HOURS.includes(slotHour);
    return {
      ...slot,
      // Afternoon slots hidden after cutoff (they'd be for tomorrow morning)
      disabled: afterCutoff && isAfternoon,
    };
  });
}

/** Banner notice shown on checkout when ordering after cutoff. */
export function getCutoffNotice(): string | null {
  if (!isAfterCutoff()) return null;
  return "Đơn đặt sau 21:00 sẽ được giao vào sáng hôm sau. Vui lòng chọn khung giờ buổi sáng.";
}
