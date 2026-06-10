const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7

export const DEFAULT_CUTOFF = "22:00"; // HH:MM Vietnam time — đặt trước 22h giao ngày mai
export const DEFAULT_AFTER_HOURS = "22:00"; // kept for API compat, same threshold

function cutoffToMinutes(cutoffTime: string): number {
  const [h, m] = cutoffTime.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

const DAY_NAMES = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

/**
 * Client-side: uses browser local time (assumes user is in Vietnam UTC+7).
 * - Đặt trước 22h hôm nay → giao ngày mai (now + 1)
 * - Đặt sau 22h hôm nay  → giao ngày mốt (now + 2)
 */
export function getDeliveryInfo(cutoffTime: string = DEFAULT_CUTOFF): {
  deliveryDate: string; // YYYY-MM-DD
  isToday: boolean;
  label: string; // "Ngày mai, Thứ Hai (26/05)" or "Ngày kia, Thứ Ba (27/05)"
} {
  const cutoffMinutes = cutoffToMinutes(cutoffTime);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const deliveryDate = new Date(now);
  const beforeCutoff = currentMinutes < cutoffMinutes;

  // Before cutoff: deliver tomorrow (+1); after cutoff: deliver day-after-tomorrow (+2)
  deliveryDate.setDate(deliveryDate.getDate() + (beforeCutoff ? 1 : 2));

  const dd = String(deliveryDate.getDate()).padStart(2, "0");
  const mm = String(deliveryDate.getMonth() + 1).padStart(2, "0");
  const yyyy = deliveryDate.getFullYear();
  const dayName = DAY_NAMES[deliveryDate.getDay()];

  return {
    deliveryDate: `${yyyy}-${mm}-${dd}`,
    isToday: false, // delivery is always at least tomorrow
    label: `${beforeCutoff ? "Ngày mai" : "Ngày kia"}, ${dayName} (${dd}/${mm})`,
  };
}

/**
 * Client-side: always returns false to disable the after-hours menu restriction.
 * The store operates 24/7 order acceptance; cutoff only affects delivery date.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isAfterHoursClient(_afterHoursTime?: string): boolean {
  return false;
}

/**
 * Server-side: explicitly converts UTC to UTC+7 before comparing cutoff.
 * - Before 22h VN time → deliver tomorrow (+1)
 * - After 22h VN time  → deliver day-after-tomorrow (+2)
 */
export function getDeliveryDateServer(
  cutoffTime: string = DEFAULT_CUTOFF,
  now: Date = new Date()
): string {
  const cutoffMinutes = cutoffToMinutes(cutoffTime);
  const vnDate = new Date(now.getTime() + VN_OFFSET_MS);
  const currentMinutes = vnDate.getUTCHours() * 60 + vnDate.getUTCMinutes();

  const daysToAdd = currentMinutes >= cutoffMinutes ? 2 : 1;
  vnDate.setUTCDate(vnDate.getUTCDate() + daysToAdd);

  const dd = String(vnDate.getUTCDate()).padStart(2, "0");
  const mm = String(vnDate.getUTCMonth() + 1).padStart(2, "0");
  return `${vnDate.getUTCFullYear()}-${mm}-${dd}`;
}
