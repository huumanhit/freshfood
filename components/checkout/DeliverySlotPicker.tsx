"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DELIVERY_SLOTS } from "@/lib/validations/order";

interface DeliverySlotPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DeliverySlotPicker({ value, onChange, error }: DeliverySlotPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        <Clock className="h-4 w-4 text-[#22c55e]" />
        Khung giờ giao hàng
        <span className="text-red-500">*</span>
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {DELIVERY_SLOTS.map((slot) => (
          <button
            key={slot.value}
            type="button"
            onClick={() => onChange(slot.value)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
              value === slot.value
                ? "border-[#22c55e] bg-[#22c55e]/5 text-[#22c55e] ring-1 ring-[#22c55e]"
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
