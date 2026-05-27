"use client";

import { useEffect, useState } from "react";
import { Clock, Save, Info } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_CUTOFF } from "@/lib/business/ordering";

export default function AdminSettingsPage() {
  const [cutoff, setCutoff] = useState(DEFAULT_CUTOFF);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/admin/settings")
      .then(({ data }) => {
        if (data.data?.order_cutoff) setCutoff(data.data.order_cutoff);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await axios.patch("/api/admin/settings", { key: "order_cutoff", value: cutoff });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-sm text-gray-500 mt-0.5">Các thông số vận hành của shop</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#22c55e]" />
          Giờ chốt đơn hàng
        </h2>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Giờ chốt (giờ Việt Nam, 24h)
          </label>
          <Input
            type="time"
            value={cutoff}
            onChange={(e) => setCutoff(e.target.value)}
            disabled={loading}
            className="rounded-xl w-36 text-base"
          />
        </div>

        <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 space-y-1 text-xs text-blue-700">
          <div className="flex items-center gap-1.5 font-semibold">
            <Info className="h-3.5 w-3.5" />
            Cách hoạt động
          </div>
          <p>• Đặt <strong>trước {cutoff}</strong> → giao <strong>cùng ngày</strong></p>
          <p>• Đặt <strong>sau {cutoff}</strong> → giao <strong>ngày hôm sau</strong></p>
          <p className="text-blue-500 mt-1">
            Thường đặt vào 2h–3h sáng để kịp đi chợ mua hàng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Đang lưu..." : "Lưu cài đặt"}
          </Button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">Đã lưu!</span>
          )}
        </div>
      </div>
    </div>
  );
}
