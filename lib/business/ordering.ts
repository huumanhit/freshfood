const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7

export const DEFAULT_CUTOFF = "02:30"; // HH:MM Vietnam time

function cutoffToMinutes(cutoffTime: string): number {
  const [h, m] = cutoffTime.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

const DAY_NAMES = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

/**
 * Client-side: uses browser local time (assumes user is in Vietnam UTC+7).
 * Returns delivery date info based on cutoff.
 */
export function getDeliveryInfo(cutoffTime: string = DEFAULT_CUTOFF): {
  deliveryDate: string; // YYYY-MM-DD
  isToday: boolean;
  label: string; // "Hôm nay, Thứ Hai (26/05)" or "Ngày mai, Thứ Ba (27/05)"
} {
  const cutoffMinutes = cutoffToMinutes(cutoffTime);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const deliveryDate = new Date(now);
  const isToday = currentMinutes < cutoffMinutes;
  if (!isToday) deliveryDate.setDate(deliveryDate.getDate() + 1);

  const dd = String(deliveryDate.getDate()).padStart(2, "0");
  const mm = String(deliveryDate.getMonth() + 1).padStart(2, "0");
  const yyyy = deliveryDate.getFullYear();
  const dayName = DAY_NAMES[deliveryDate.getDay()];

  return {
    deliveryDate: `${yyyy}-${mm}-${dd}`,
    isToday,
    label: `${isToday ? "Hôm nay" : "Ngày mai"}, ${dayName} (${dd}/${mm})`,
  };
}

/**
 * Server-side: explicitly converts UTC to UTC+7 before comparing cutoff.
 */
export function getDeliveryDateServer(
  cutoffTime: string = DEFAULT_CUTOFF,
  now: Date = new Date()
): string {
  const cutoffMinutes = cutoffToMinutes(cutoffTime);
  const vnDate = new Date(now.getTime() + VN_OFFSET_MS);
  const currentMinutes = vnDate.getUTCHours() * 60 + vnDate.getUTCMinutes();

  if (currentMinutes >= cutoffMinutes) vnDate.setUTCDate(vnDate.getUTCDate() + 1);

  const dd = String(vnDate.getUTCDate()).padStart(2, "0");
  const mm = String(vnDate.getUTCMonth() + 1).padStart(2, "0");
  return `${vnDate.getUTCFullYear()}-${mm}-${dd}`;
}
