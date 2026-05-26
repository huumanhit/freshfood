"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { CartItemList } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function CartPage() {
  const { items, clearCart, itemCount } = useCart();

  return (
    <div className="bg-white min-h-screen">
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-gray-900 flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-[#22c55e]" />
              Giỏ hàng
              {itemCount > 0 && (
                <span className="text-base font-normal text-gray-400">
                  ({itemCount} sản phẩm)
                </span>
              )}
            </h1>
          </div>
          {itemCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-500 hover:bg-red-50 text-sm"
              onClick={clearCart}
            >
              Xóa tất cả
            </Button>
          )}
        </div>

        {itemCount === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Item list */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <CartItemList items={items} />
              </div>

              <div className="mt-4">
                <Link
                  href={ROUTES.PRODUCTS}
                  className="text-sm text-gray-400 hover:text-[#22c55e] transition-colors"
                >
                  ← Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            {/* Summary sidebar */}
            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
