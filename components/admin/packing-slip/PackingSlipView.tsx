"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Printer, Loader2, Package } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface SlipItem {
  id: string;
  productName: string;
  image: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

interface PackingSlip {
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  deliverySlot: string | null;
  note: string | null;
  customer: { name: string; phone: string; email: string };
  address: string | null;
  items: SlipItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode: string | null;
  total: number;
}

const PAYMENT_LABELS: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản",
  VNPAY: "VNPay",
  STRIPE: "Stripe",
  MOMO: "MoMo",
};

export function PackingSlipView({ orderId }: { orderId: string }) {
  const { data, isLoading } = useQuery<{ slip: PackingSlip }>({
    queryKey: ["packing-slip", orderId],
    queryFn: () => axios.get(`/api/admin/packing-slips/${orderId}`).then((r) => r.data),
  });

  if (isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-gray-300 animate-spin" /></div>;
  }

  const slip = data?.slip;
  if (!slip) return <p className="text-gray-500 text-center py-10">Không tìm thấy phiếu đóng gói</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-lg font-bold text-gray-800">Phiếu đóng gói — #{slip.orderNumber}</h2>
        <Button onClick={() => window.print()} className="rounded-xl gap-1.5 bg-gray-800 hover:bg-gray-900 text-white">
          <Printer className="h-4 w-4" /> In phiếu
        </Button>
      </div>

      {/* Printable slip */}
      <div className="print-area bg-white border border-gray-200 rounded-2xl p-6 space-y-5 text-sm max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-[#22c55e]">FreshFood</p>
            <p className="text-xs text-gray-400">Thực phẩm tươi sạch</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-800 text-base">#{slip.orderNumber}</p>
            <p className="text-xs text-gray-400">{formatDateTime(slip.createdAt)}</p>
          </div>
        </div>

        <Separator />

        {/* Customer + Delivery */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Khách hàng</p>
            <p className="font-semibold text-gray-800">{slip.customer.name}</p>
            <p className="text-gray-600">{slip.customer.phone}</p>
            {slip.address && <p className="text-gray-500 text-xs leading-relaxed mt-1">{slip.address}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Giao hàng</p>
            {slip.deliverySlot && (
              <p className="font-medium text-gray-800">{String(slip.deliverySlot).replace("-", " – ")}</p>
            )}
            <p className="text-gray-600 text-xs mt-1">{PAYMENT_LABELS[slip.paymentMethod] ?? slip.paymentMethod}</p>
          </div>
        </div>

        {slip.note && (
          <div className="bg-yellow-50 rounded-xl px-3 py-2">
            <p className="text-xs text-yellow-700 font-medium">Ghi chú: {slip.note}</p>
          </div>
        )}

        <Separator />

        {/* Items */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Package className="h-3 w-3" /> Sản phẩm ({slip.items.length})
          </p>
          <div className="space-y-2">
            {slip.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                  {item.image ? (
                    <Image src={item.image} alt={item.productName} width={40} height={40} className="object-cover" unoptimized />
                  ) : (
                    <div className="h-full w-full bg-gray-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate text-xs">{item.productName}</p>
                  <p className="text-gray-400 text-xs">{formatCurrency(item.price)} × {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800 shrink-0">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-gray-500">
            <span>Tạm tính</span><span>{formatCurrency(slip.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Phí vận chuyển</span>
            {slip.shippingFee === 0 ? <span className="text-green-600">Miễn phí</span> : <span>{formatCurrency(slip.shippingFee)}</span>}
          </div>
          {slip.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá {slip.couponCode && `(${slip.couponCode})`}</span>
              <span>-{formatCurrency(slip.discount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Tổng cộng</span>
            <span className="text-[#22c55e]">{formatCurrency(slip.total)}</span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 pt-2">Cảm ơn bạn đã tin dùng FreshFood!</p>
      </div>
    </div>
  );
}
