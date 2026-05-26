"use client";

import { Banknote, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  {
    value: "COD",
    label: "Thanh toán khi nhận hàng",
    description: "Trả tiền mặt khi shipper giao hàng",
    icon: Banknote,
  },
  {
    value: "BANK_TRANSFER",
    label: "Chuyển khoản / VietQR",
    description: "Chuyển khoản trước qua QR code",
    icon: CreditCard,
  },
] as const;

interface PaymentMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PaymentMethodSelector({ value, onChange, error }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Phương thức thanh toán
        <span className="text-red-500 ml-0.5">*</span>
      </label>

      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const selected = value === method.value;
          return (
            <button
              key={method.value}
              type="button"
              onClick={() => onChange(method.value)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
                selected
                  ? "border-[#22c55e] bg-[#22c55e]/5 ring-1 ring-[#22c55e]"
                  : "border-gray-200 hover:border-[#22c55e]/50 hover:bg-gray-50"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  selected ? "bg-[#22c55e] text-white" : "bg-gray-100 text-gray-500"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", selected ? "text-[#22c55e]" : "text-gray-800")}>
                  {method.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{method.description}</p>
              </div>
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 shrink-0 transition-colors",
                  selected ? "border-[#22c55e] bg-[#22c55e]" : "border-gray-300"
                )}
              />
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
