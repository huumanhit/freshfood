"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Sparkles, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Phase2UnderDevelopmentProps {
  featureName: string;
  description?: string;
  plannedFeatures?: string[];
  backUrl?: string;
  backLabel?: string;
}

export function Phase2UnderDevelopment({
  featureName,
  description = "Chức năng này thuộc giai đoạn Phase 2 và đang tạm thời đóng theo lộ trình triển khai ban đầu. Sẽ được mở ra hoạt động ngay khi khách hàng chốt kích hoạt.",
  plannedFeatures = [],
  backUrl = "/admin/orders",
  backLabel = "Quay lại danh sách đơn hàng",
}: Phase2UnderDevelopmentProps) {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="rounded-3xl border border-dashed border-amber-300 bg-gradient-to-b from-amber-50/60 to-white p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
        {/* Decorative corner tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold mb-6">
          <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
          <span>PHASE 2 • ĐANG TRONG LỘ TRÌNH PHÁT TRIỂN</span>
        </div>

        {/* Feature Icon + Title */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center mb-5 text-amber-600 shadow-inner">
          <Sparkles className="h-8 w-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {featureName}
        </h1>

        <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed mb-8">
          {description}
        </p>

        {/* Planned highlights if any */}
        {plannedFeatures.length > 0 && (
          <div className="bg-white/80 rounded-2xl border border-amber-100 p-5 mb-8 text-left max-w-lg mx-auto shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-amber-600" />
              Các tính năng sẽ phát triển trong phase 2:
            </p>
            <ul className="space-y-2 text-xs text-gray-600">
              {plannedFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#16a34a] font-bold">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white gap-2 font-medium">
            <Link href={backUrl}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>

          <Button asChild variant="outline" className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50">
            <Link href="/admin/dashboard">
              Về Dashboard
            </Link>
          </Button>
        </div>

        {/* Footer note */}
        <div className="mt-8 pt-6 border-t border-amber-200/50 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
          <span>Tính năng sẽ được kích hoạt khi triển khai giai đoạn Phase 2.</span>
        </div>
      </div>
    </div>
  );
}
