"use client";

import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DELIVERY_SLOTS } from "@/lib/validations/order";
import { getAvailableSlots, getCutoffNotice } from "@/lib/business/ordering";

interface DeliverySlotPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DeliverySlotPicker({ value, onChange, error }: DeliverySlotPickerProps) {
  const [slots, setSlots] = useState(
    DELIVERY_SLOTS.map((s) => ({ ...s, disabled: false }))
  );
  const [notice, setNotice] = useState<string | null>(null);

  // Compute time-based availability only on the client to avoid hydration mismatch
  useEffect(() => {
    setSlots(getAvailableSlots());
    setNotice(getCutoffNotice());
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        <Clock className="h-4 w-4 text-[#22c55e]" />
        Khung giờ giao hàng
        <span className="text-red-500">*</span>
      </label>

      {notice && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          {notice}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.value}
            type="button"
            disabled={slot.disabled}
            onClick={() => !slot.disabled && onChange(slot.value)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
              slot.disabled
                ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                : value === slot.value
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
