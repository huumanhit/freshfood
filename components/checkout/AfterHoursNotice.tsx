"use client";

import { Phone, Clock } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";

export function AfterHoursNotice() {
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 text-center space-y-4">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
          <Clock className="h-8 w-8 text-orange-400" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-gray-800">Ngoài giờ đặt hàng</h3>
        <p className="text-sm text-gray-500">
          Hệ thống nhận đặt hàng từ <span className="font-semibold">5:00</span> đến{" "}
          <span className="font-semibold">21:00</span> mỗi ngày.
        </p>
        <p className="text-sm text-gray-500">
          Hiện tại đã quá 21:00, bạn có thể đặt hàng vào sáng mai hoặc liên hệ hotline để được hỗ trợ.
        </p>
      </div>

      <a
        href={`tel:${APP_CONFIG.phone.replace(/\s/g, "")}`}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition-colors"
      >
        <Phone className="h-4 w-4" />
        Gọi hotline {APP_CONFIG.phone}
      </a>
    </div>
  );
}
