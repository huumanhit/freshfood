"use client";

import { useEffect, useState } from "react";
import { Clock, Save, Info, KeyRound, Eye, EyeOff, Plus, Trash2, GripVertical } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_CUTOFF, DEFAULT_AFTER_HOURS } from "@/lib/business/ordering";
import { DELIVERY_SLOTS } from "@/lib/validations/order";

interface Slot { value: string; label: string }

export default function AdminSettingsPage() {
  const [cutoff, setCutoff] = useState(DEFAULT_CUTOFF);
  const [afterHours, setAfterHours] = useState(DEFAULT_AFTER_HOURS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Delivery slots state
  const [slots, setSlots] = useState<Slot[]>([...DELIVERY_SLOTS]);
  const [slotsSaving, setSlotsSaving] = useState(false);
  const [slotsSaved, setSlotsSaved] = useState(false);

  // Password change state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    axios.get("/api/admin/settings")
      .then(({ data }) => {
        if (data.data?.order_cutoff) setCutoff(data.data.order_cutoff);
        if (data.data?.after_hours_cutoff) setAfterHours(data.data.after_hours_cutoff);
        if (data.data?.delivery_slots) {
          try {
            const parsed = JSON.parse(data.data.delivery_slots);
            if (Array.isArray(parsed) && parsed.length > 0) setSlots(parsed);
          } catch { /* keep defaults */ }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleChangePassword() {
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: "error", text: "Mật khẩu xác nhận không khớp" });
      return;
    }
    if (newPwd.length < 8) {
      setPwdMsg({ type: "error", text: "Mật khẩu mới tối thiểu 8 ký tự" });
      return;
    }
    setPwdSaving(true);
    setPwdMsg(null);
    try {
      await axios.post("/api/admin/change-password", { currentPassword: currentPwd, newPassword: newPwd });
      setPwdMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Lỗi đổi mật khẩu";
      setPwdMsg({ type: "error", text: msg });
    } finally {
      setPwdSaving(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all([
        axios.patch("/api/admin/settings", { key: "order_cutoff", value: cutoff }),
        axios.patch("/api/admin/settings", { key: "after_hours_cutoff", value: afterHours }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSlots() {
    if (slots.some((s) => !s.value.trim() || !s.label.trim())) return;
    setSlotsSaving(true);
    setSlotsSaved(false);
    try {
      await axios.patch("/api/admin/settings", {
        key: "delivery_slots",
        value: JSON.stringify(slots),
      });
      setSlotsSaved(true);
      setTimeout(() => setSlotsSaved(false), 3000);
    } finally {
      setSlotsSaving(false);
    }
  }

  function addSlot() {
    setSlots((prev) => [...prev, { value: "", label: "" }]);
  }

  function removeSlot(idx: number) {
    setSlots((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateSlot(idx: number, field: "value" | "label", val: string) {
    setSlots((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-sm text-gray-500 mt-0.5">Các thông số vận hành của shop</p>
      </div>

      {/* ── Giờ chốt đơn ── */}
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
          <p>• Đặt <strong>trước {cutoff}</strong> → giao <strong>ngày mai</strong></p>
          <p>• Đặt <strong>sau {cutoff}</strong> → giao <strong>ngày kia</strong></p>
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

      {/* ── Khung giờ giao hàng ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            Khung giờ giao hàng
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Danh sách khung giờ khách hàng có thể chọn khi đặt hàng.
          </p>
        </div>

        <div className="space-y-2.5">
          {slots.map((slot, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
              <Input
                placeholder="Mã giờ, vd: 08:00-12:00"
                value={slot.value}
                onChange={(e) => updateSlot(idx, "value", e.target.value)}
                className="rounded-xl flex-1 text-sm font-mono"
              />
              <Input
                placeholder="Tên hiển thị, vd: Sáng (8h-12h)"
                value={slot.label}
                onChange={(e) => updateSlot(idx, "label", e.target.value)}
                className="rounded-xl flex-1 text-sm"
              />
              <button
                type="button"
                onClick={() => removeSlot(idx)}
                disabled={slots.length <= 1}
                className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                title="Xóa khung giờ này"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addSlot}
          className="flex items-center gap-2 text-sm text-[#16a34a] font-medium hover:text-[#15803d] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm khung giờ
        </button>

        <div className="rounded-xl bg-purple-50 border border-purple-200 px-4 py-3 text-xs text-purple-700 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <Info className="h-3.5 w-3.5" />
            Lưu ý định dạng
          </div>
          <p>• <strong>Mã giờ:</strong> dạng <code className="bg-purple-100 px-1 rounded">HH:MM-HH:MM</code>, ví dụ: <code className="bg-purple-100 px-1 rounded">08:00-12:00</code></p>
          <p>• <strong>Tên hiển thị:</strong> nội dung khách nhìn thấy, ví dụ: <em>Sáng (8h-12h)</em></p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveSlots}
            disabled={slotsSaving || loading || slots.some((s) => !s.value.trim() || !s.label.trim())}
            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white gap-2"
          >
            <Save className="h-4 w-4" />
            {slotsSaving ? "Đang lưu..." : "Lưu khung giờ"}
          </Button>
          {slotsSaved && (
            <span className="text-sm text-purple-600 font-medium">Đã lưu khung giờ!</span>
          )}
        </div>
      </div>

      {/* ── After-hours cutoff (ẩn nhãn cũ không còn dùng) ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          Giờ chuyển chế độ sau giờ
        </h2>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Giờ bắt đầu hạn chế menu (giờ Việt Nam, 24h)
          </label>
          <Input
            type="time"
            value={afterHours}
            onChange={(e) => setAfterHours(e.target.value)}
            disabled={loading}
            className="rounded-xl w-36 text-base"
          />
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 space-y-1 text-xs text-amber-700">
          <div className="flex items-center gap-1.5 font-semibold">
            <Info className="h-3.5 w-3.5" />
            Cách hoạt động
          </div>
          <p>• Trước {afterHours}: hiển thị <strong>toàn bộ</strong> sản phẩm + tất cả khung giờ</p>
          <p>• Sau {afterHours}: chỉ hiển thị <strong>sản phẩm Lõi</strong> + khung giờ từ 9h trở đi</p>
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

      {/* ── Đổi mật khẩu ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[#22c55e]" />
          Đổi mật khẩu admin
        </h2>

        <div className="space-y-3 max-w-sm">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="rounded-xl pr-10"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="rounded-xl pr-10"
                placeholder="Tối thiểu 8 ký tự"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
            <Input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className="rounded-xl"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          {pwdMsg && (
            <p className={`text-sm font-medium ${pwdMsg.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {pwdMsg.text}
            </p>
          )}

          <Button
            onClick={handleChangePassword}
            disabled={pwdSaving || !currentPwd || !newPwd || !confirmPwd}
            className="rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white gap-2"
          >
            <Save className="h-4 w-4" />
            {pwdSaving ? "Đang lưu..." : "Đổi mật khẩu"}
          </Button>
        </div>
      </div>
    </div>
  );
}
