"use client";

import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

const BANK_INFO = {
  bankName: "Vietcombank",
  accountNumber: "1234567890",
  accountName: "CONG TY TNHH FRESHFOOD",
  branch: "TP. Hồ Chí Minh",
} as const;

interface VietQRDisplayProps {
  total: number;
  orderNote?: string;
}

export function VietQRDisplay({ total, orderNote }: VietQRDisplayProps) {
  const [copied, setCopied] = useState<string | null>(null);

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const transferContent = orderNote ? `FRESHFOOD ${orderNote}` : "FRESHFOOD THANH TOAN";

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">QR</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Thông tin chuyển khoản</p>
          <p className="text-xs text-gray-500">Vui lòng chuyển khoản trước khi xác nhận đơn hàng</p>
        </div>
      </div>

      <div className="rounded-lg bg-white border border-blue-100 divide-y divide-gray-100">
        {[
          { label: "Ngân hàng", value: BANK_INFO.bankName, key: "bank" },
          { label: "Số tài khoản", value: BANK_INFO.accountNumber, key: "account" },
          { label: "Chủ tài khoản", value: BANK_INFO.accountName, key: "name" },
          { label: "Chi nhánh", value: BANK_INFO.branch, key: "branch" },
          { label: "Số tiền", value: formatCurrency(total), key: "amount" },
          { label: "Nội dung CK", value: transferContent, key: "content" },
        ].map(({ label, value, key }) => (
          <div key={key} className="flex items-center justify-between px-3 py-2.5 gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(value, key)}
              className="shrink-0 p-1 rounded text-gray-400 hover:text-blue-500 transition-colors"
              aria-label={`Sao chép ${label}`}
            >
              {copied === key ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-blue-600 bg-blue-100 rounded-lg px-3 py-2">
        Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được thanh toán (trong giờ hành chính).
      </p>
    </div>
  );
}
