"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DELIVERY_SLOTS } from "@/lib/validations/order";
import { getDeliveryInfo, DEFAULT_CUTOFF } from "@/lib/business/ordering";

interface Slot { value: string; label: string }

interface DeliverySlotPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DeliverySlotPicker({ value, onChange, error }: DeliverySlotPickerProps) {
  const [deliveryLabel, setDeliveryLabel] = useState<string | null>(null);
  const [isToday, setIsToday] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([...DELIVERY_SLOTS]);

  useEffect(() => {
    fetch("/api/checkout/config")
      .then((r) => r.json())
      .then(({ cutoff: c, deliverySlots: ds }) => {
        const cf = c ?? DEFAULT_CUTOFF;
        const info = getDeliveryInfo(cf);
        setDeliveryLabel(info.label);
        setIsToday(info.isToday);
        if (Array.isArray(ds) && ds.length > 0) setSlots(ds);
      })
      .catch(() => {
        const info = getDeliveryInfo(DEFAULT_CUTOFF);
        setDeliveryLabel(info.label);
        setIsToday(info.isToday);
      });
  }, []);

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
        Chốt đơn trước 22h hôm nay — giao ngày mai. Sau 22h — giao ngày kia.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((slot) => (
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
