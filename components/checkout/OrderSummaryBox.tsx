"use client";

import Image from "next/image";
import { Truck } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency, getProductPrice } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function OrderSummaryBox() {
  const { items, subtotal, shippingFee, total } = useCart();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 sticky top-24">
      <h3 className="font-bold text-gray-900 text-base">Đơn hàng của bạn</h3>

      {/* Items */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {items.map((item) => {
          const price = getProductPrice(item.product.price, item.product.salePrice);
          const img = item.product.images.find((i) => i.isPrimary) ?? item.product.images[0];
          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                {img ? (
                  <Image src={img.url} alt={item.product.name} fill sizes="48px" className="object-cover" unoptimized />
                ) : (
                  <div className="h-full w-full bg-gray-100" />
                )}
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#16a34a] text-white text-[10px] font-bold flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 line-clamp-1">{item.product.name}</p>
                <p className="text-xs text-gray-400">{item.product.unit}</p>
              </div>
              <span className="text-xs font-semibold text-gray-800 shrink-0">
                {formatCurrency(price * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Tạm tính</span>
          <span className="text-gray-800 font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-500 text-sm">
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            Phí vận chuyển
          </span>
          <span className="text-gray-500 text-xs">Tính theo km khi giao</span>
        </div>
        <Separator />
        <div className="space-y-1">
          <div className="flex justify-between font-bold text-base">
            <span className="text-gray-900">Tổng tiền hàng</span>
            <span className="text-[#22c55e] text-lg">{formatCurrency(total)}</span>
          </div>
          <p className="text-[11px] text-gray-400 text-right">* Phí ship tính riêng theo km khi nhận hàng</p>
        </div>
      </div>
    </div>
  );
}
