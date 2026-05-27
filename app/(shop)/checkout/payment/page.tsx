"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Copy, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const BANK_INFO = {
  bankId: "TCB",
  bankName: "Techcombank",
  accountNumber: "19032907272011",
  accountName: "LE HOANG ANH",
} as const;

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 p-1 rounded text-gray-400 hover:text-[#16a34a] transition-colors"
      aria-label={`Sao chép ${label}`}
    >
      {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function PaymentContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);

  const orderId = params.get("orderId") ?? "";
  const orderNumber = params.get("orderNumber") ?? "";
  const amount = Number(params.get("amount") ?? 0);
  const phone = params.get("phone") ?? "";

  const transferContent = `TUOINGON ${orderNumber}`;

  const qrUrl =
    `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-compact2.jpg` +
    `?amount=${Math.round(amount)}` +
    `&addInfo=${encodeURIComponent(transferContent)}` +
    `&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  const rows = [
    { label: "Ngân hàng", value: BANK_INFO.bankName, key: "bank" },
    { label: "Số tài khoản", value: BANK_INFO.accountNumber, key: "account" },
    { label: "Chủ tài khoản", value: BANK_INFO.accountName, key: "name" },
    { label: "Số tiền", value: formatCurrency(amount), key: "amount" },
    { label: "Nội dung CK", value: transferContent, key: "content" },
  ];

  function handleConfirm() {
    router.push(`${ROUTES.CHECKOUT_SUCCESS}?orderId=${orderId}&phone=${encodeURIComponent(phone)}`);
  }

  return (
    <div className="bg-[#f7fdf8] min-h-screen py-8">
      <div className="container max-w-lg space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400">
          <Link href={ROUTES.HOME} className="hover:text-[#22c55e] transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={ROUTES.CART} className="hover:text-[#22c55e] transition-colors">Giỏ hàng</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-600">Thanh toán</span>
        </nav>

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Quét mã thanh toán</h1>
          <p className="text-sm text-gray-500">
            Đơn hàng <span className="font-semibold text-gray-800">#{orderNumber}</span> — {formatCurrency(amount)}
          </p>
        </div>

        {/* QR Code */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-4">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm inline-block">
              <Image
                src={qrUrl}
                alt="VietQR thanh toán"
                width={240}
                height={300}
                unoptimized
                className="rounded-xl"
              />
            </div>
          </div>

          <p className="text-xs text-center text-gray-400">
            Mở app ngân hàng → Quét mã → Kiểm tra số tiền & nội dung → Xác nhận
          </p>

          {/* Manual info */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 divide-y divide-gray-100">
            {rows.map(({ label, value, key }) => (
              <div key={key} className="flex items-center justify-between px-3 py-2.5 gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className={`text-sm font-medium truncate ${key === "amount" ? "text-[#16a34a] font-bold" : "text-gray-800"}`}>
                    {value}
                  </p>
                </div>
                <CopyButton value={value} label={label} />
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 text-center">
            Vui lòng chuyển khoản đúng <strong>số tiền</strong> và <strong>nội dung</strong> để đơn được xác nhận tự động.
          </div>
        </div>

        {/* Confirmation checkbox + CTA */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#16a34a]"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              Tôi xác nhận đã chuyển khoản <strong className="text-[#16a34a]">{formatCurrency(amount)}</strong> với nội dung <strong className="text-gray-800">{`TUOINGON ${orderNumber}`}</strong> đến tài khoản Techcombank trên.
            </span>
          </label>

          <Button
            onClick={handleConfirm}
            disabled={!confirmed}
            className="w-full h-12 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Xác nhận đã thanh toán
          </Button>
        </div>

        <p className="text-xs text-center text-gray-400">
          Đơn hàng sẽ được xác nhận sau khi chúng tôi kiểm tra giao dịch.
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}
