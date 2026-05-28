"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DELIVERY_SLOTS } from "@/lib/validations/order";
import { getDeliveryInfo, DEFAULT_CUTOFF, DEFAULT_AFTER_HOURS, isAfterHoursClient } from "@/lib/business/ordering";

interface DeliverySlotPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DeliverySlotPicker({ value, onChange, error }: DeliverySlotPickerProps) {
  const [cutoff, setCutoff] = useState(DEFAULT_CUTOFF);
  const [deliveryLabel, setDeliveryLabel] = useState<string | null>(null);
  const [isToday, setIsToday] = useState(false);
  const [afterHours, setAfterHours] = useState(false);

  useEffect(() => {
    fetch("/api/checkout/config")
      .then((r) => r.json())
      .then(({ cutoff: c, afterHoursCutoff: ahc }) => {
        const cf = c ?? DEFAULT_CUTOFF;
        setCutoff(cf);
        const info = getDeliveryInfo(cf);
        setDeliveryLabel(info.label);
        setIsToday(info.isToday);
        setAfterHours(isAfterHoursClient(ahc ?? DEFAULT_AFTER_HOURS));
      })
      .catch(() => {
        const info = getDeliveryInfo(DEFAULT_CUTOFF);
        setDeliveryLabel(info.label);
        setIsToday(info.isToday);
        setAfterHours(isAfterHoursClient(DEFAULT_AFTER_HOURS));
      });
  }, []);

  // PA2: after cutoff hour, hide early-morning slots (before 09:00)
  const visibleSlots = afterHours
    ? DELIVERY_SLOTS.filter((s) => parseInt(s.value.split(":")[0]) >= 9)
    : DELIVERY_SLOTS;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        <Clock className="h-4 w-4 text-[#22c55e]" />
        Khung giờ giao hàng
        <span className="text-red-500">*</span>
      </label>

      {/* Delivery date badge */}
      {deliveryLabel && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold",
            isToday
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-blue-50 border border-blue-200 text-blue-700"
          )}
        >
          <Calendar className="h-4 w-4 shrink-0" />
          Giao: {deliveryLabel}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Chốt đơn lúc {cutoff} — đặt trước {cutoff} giao cùng ngày, sau {cutoff} giao ngày hôm sau.
      </p>

      {afterHours && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
          Sau giờ chốt: chỉ nhận đặt từ 9h trở đi cho ngày hôm sau với món phổ thông.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {visibleSlots.map((slot) => (
          <button
            key={slot.value}
            type="button"
            onClick={() => onChange(slot.value)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
              value === slot.value
                ? "border-[#22c55e] bg-[#16a34a]/5 text-[#22c55e] ring-1 ring-[#22c55e]"
                : "border-gray-200 text-gray-600 hover:border-[#22c55e]/50 hover:bg-gray-50"
            )}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
