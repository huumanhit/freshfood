"use client";

import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function CartSummary() {
  const { subtotal, shippingFee, total, itemCount } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5 sticky top-24">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-[#22c55e]" />
        Tóm tắt đơn hàng
      </h2>

      {/* Totals */}
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính ({itemCount} sản phẩm)</span>
          <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Phí vận chuyển</span>
          <span className="text-gray-500 text-xs">Tính theo km khi giao</span>
        </div>
        <Separator />
        <div className="space-y-1">
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Tổng tiền hàng</span>
            <span className="text-[#22c55e] text-lg">{formatCurrency(total)}</span>
          </div>
          <p className="text-[11px] text-gray-400 text-right">* Phí ship tính riêng theo km khi nhận hàng</p>
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
