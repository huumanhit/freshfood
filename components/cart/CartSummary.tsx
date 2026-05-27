"use client";

import Link from "next/link";
import { ShoppingCart, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { SHIPPING } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function CartSummary() {
  const { subtotal, shippingFee, total, hasFreeShipping, freeShippingRemaining, itemCount } = useCart();

  if (itemCount === 0) return null;

  const progressPct = Math.min(100, Math.round((subtotal / SHIPPING.FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5 sticky top-24">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-[#22c55e]" />
        Tóm tắt đơn hàng
      </h2>

      {/* Free shipping progress */}
      <div className="space-y-2">
        {hasFreeShipping ? (
          <div className="flex items-center gap-2 text-sm text-[#22c55e] font-medium">
            <Truck className="h-4 w-4" />
            Bạn được miễn phí vận chuyển!
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Mua thêm{" "}
            <span className="font-semibold text-[#22c55e]">{formatCurrency(freeShippingRemaining)}</span>{" "}
            để được miễn phí vận chuyển
          </p>
        )}
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <Separator />

      {/* Totals */}
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính ({itemCount} sản phẩm)</span>
          <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Phí vận chuyển</span>
          {hasFreeShipping ? (
            <span className="font-medium text-[#22c55e]">Miễn phí</span>
          ) : (
            <span className="font-medium text-gray-900">{formatCurrency(shippingFee)}</span>
          )}
        </div>
        <Separator />
        <div className="flex justify-between text-base font-bold text-gray-900">
          <span>Tổng cộng</span>
          <span className="text-[#22c55e] text-lg">{formatCurrency(total)}</span>
        </div>
      </div>

      <Button
        asChild
        className="w-full h-12 rounded-xl bg-[#16a34a] hover:bg-[#16a34a] text-white font-semibold text-base"
      >
        <Link href={ROUTES.CHECKOUT}>
          Tiến hành đặt hàng
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>

      <Link
        href={ROUTES.PRODUCTS}
        className="block text-center text-sm text-gray-400 hover:text-[#22c55e] transition-colors"
      >
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}
