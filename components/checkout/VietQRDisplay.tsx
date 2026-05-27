"use client";

import Image from "next/image";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

const BANK_INFO = {
  bankId: "TCB",
  bankName: "Techcombank",
  accountNumber: "19032907272011",
  accountName: "LE HOANG ANH",
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

  const transferContent = orderNote?.trim()
    ? `TUOINGON ${orderNote.trim().toUpperCase().replace(/[^\w\s]/gi, "")}`
    : "TUOINGON THANH TOAN";

  const qrUrl =
    `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-compact2.jpg` +
    `?amount=${Math.round(total)}` +
    `&addInfo=${encodeURIComponent(transferContent)}` +
    `&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  const rows = [
    { label: "Ngân hàng", value: BANK_INFO.bankName, key: "bank" },
    { label: "Số tài khoản", value: BANK_INFO.accountNumber, key: "account" },
    { label: "Chủ tài khoản", value: BANK_INFO.accountName, key: "name" },
    { label: "Số tiền", value: formatCurrency(total), key: "amount" },
    { label: "Nội dung CK", value: transferContent, key: "content" },
  ];

  return (
    <div className="rounded-xl border border-[#22c55e]/30 bg-green-50/50 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-[#16a34a] flex items-center justify-center">
          <span className="text-white text-xs font-bold">QR</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Quét mã QR để thanh toán</p>
          <p className="text-xs text-gray-500">Mở app ngân hàng → Quét mã → Kiểm tra số tiền → Xác nhận</p>
        </div>
      </div>

      {/* QR Code image */}
      <div className="flex justify-center">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 inline-block">
          <Image
            src={qrUrl}
            alt="VietQR thanh toán"
            width={220}
            height={280}
            unoptimized
            className="rounded-xl"
          />
        </div>
      </div>

      <p className="text-xs text-center text-gray-500">
        Hoặc chuyển khoản thủ công theo thông tin bên dưới
      </p>

      {/* Manual transfer info */}
      <div className="rounded-lg bg-white border border-gray-100 divide-y divide-gray-100">
        {rows.map(({ label, value, key }) => (
          <div key={key} className="flex items-center justify-between px-3 py-2.5 gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-sm font-medium truncate ${key === "amount" ? "text-[#16a34a] font-bold" : "text-gray-800"}`}>
                {value}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(value, key)}
              className="shrink-0 p-1 rounded text-gray-400 hover:text-[#16a34a] transition-colors"
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

      <p className="text-xs text-[#16a34a] bg-green-100 rounded-lg px-3 py-2 text-center">
        Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được thanh toán.
      </p>
    </div>
  );
}
