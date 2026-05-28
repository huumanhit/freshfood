"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, Truck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type DeliveryAction = "pickup" | "delivered" | "failed";

export interface DeliveryActionPayload {
  status: "SHIPPED" | "DELIVERED" | "FAILED";
  codCollected?: boolean;
  notes?: string;
  failReason?: string;
}

interface DeliveryActionModalProps {
  open: boolean;
  action: DeliveryAction | null;
  orderNumber: string;
  paymentMethod: string;
  onClose: () => void;
  onConfirm: (payload: DeliveryActionPayload) => void;
  isLoading: boolean;
}

const FAIL_REASONS = [
  "Khách không có nhà",
  "Sai địa chỉ",
  "Khách từ chối nhận",
  "Không liên lạc được",
  "Khác",
];

export function DeliveryActionModal({
  open,
  action,
  orderNumber,
  paymentMethod,
  onClose,
  onConfirm,
  isLoading,
}: DeliveryActionModalProps) {
  const [codCollected, setCodCollected] = useState(false);
  const [notes, setNotes] = useState("");
  const [failReason, setFailReason] = useState("");

  const isCod = paymentMethod === "COD";

  function handleClose() {
    if (isLoading) return;
    setCodCollected(false);
    setNotes("");
    setFailReason("");
    onClose();
  }

  function handleConfirm() {
    if (action === "pickup") {
      onConfirm({ status: "SHIPPED", notes: notes || undefined });
    } else if (action === "delivered") {
      onConfirm({ status: "DELIVERED", codCollected, notes: notes || undefined });
    } else if (action === "failed") {
      onConfirm({
        status: "FAILED",
        failReason: failReason || undefined,
        notes: notes || undefined,
      });
    }
  }

  const config = {
    pickup: {
      title: "Bắt đầu giao hàng",
      icon: <Truck className="h-5 w-5 text-blue-500" />,
      description: `Xác nhận bắt đầu giao đơn #${orderNumber}?`,
      confirmLabel: "Bắt đầu giao",
      confirmClass: "bg-blue-500 hover:bg-blue-600",
    },
    delivered: {
      title: "Xác nhận đã giao",
      icon: <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />,
      description: `Đánh dấu đơn #${orderNumber} đã giao thành công?`,
      confirmLabel: "Xác nhận đã giao",
      confirmClass: "bg-[#16a34a] hover:bg-[#16a34a]",
    },
    failed: {
      title: "Báo giao hàng thất bại",
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      description: `Báo cáo giao hàng thất bại cho đơn #${orderNumber}.`,
      confirmLabel: "Xác nhận thất bại",
      confirmClass: "bg-red-500 hover:bg-red-600",
    },
  };

  if (!action) return null;
  const cfg = config[action];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {cfg.icon}
            {cfg.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <p className="text-sm text-gray-600">{cfg.description}</p>

          {/* COD checkbox for delivered */}
          {action === "delivered" && isCod && (
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
              <Checkbox
                id="cod"
                checked={codCollected}
                onCheckedChange={(v) => setCodCollected(!!v)}
                className="h-5 w-5"
              />
              <Label htmlFor="cod" className="text-sm font-medium cursor-pointer">
                Đã thu tiền COD
              </Label>
            </div>
          )}

          {/* Fail reason for failed */}
          {action === "failed" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Lý do thất bại</Label>
              <Select value={failReason} onValueChange={setFailReason}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Chọn lý do..." />
                </SelectTrigger>
                <SelectContent>
                  {FAIL_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes (all actions) */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">
              Ghi chú {action !== "failed" && "(tuỳ chọn)"}
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú..."
              rows={2}
              className="rounded-xl resize-none text-sm"
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 rounded-xl"
          >
            Huỷ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || (action === "failed" && !failReason)}
            className={`flex-1 rounded-xl text-white ${cfg.confirmClass}`}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {cfg.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
