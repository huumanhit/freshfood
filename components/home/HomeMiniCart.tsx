"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, X, Minus, Plus, ArrowRight, Truck, Banknote, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function HomeMiniCart() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    shippingFee,
    total,
    itemCount,
    hasFreeShipping,
  } = useCart();

  return (
    <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <ShoppingBag className="h-4 w-4 text-[#22c55e]" />
        <h3 className="font-bold text-sm text-gray-800">Đơn hàng của bạn</h3>
        {itemCount > 0 && (
          <span className="ml-auto rounded-full bg-[#16a34a] px-2 py-0.5 text-[10px] font-bold text-white">
            {itemCount} sp
          </span>
        )}
      </div>

      {/* Items */}
      <div className="max-h-72 overflow-y-auto px-3 py-2 space-y-2">
        <AnimatePresence initial={false}>
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 gap-2 text-center"
            >
              <ShoppingBag className="h-8 w-8 text-gray-200" />
              <p className="text-xs text-gray-400">Chưa có sản phẩm</p>
            </motion.div>
          ) : (
            items.map((item) => {
              const img = item.product.images?.find((i) => i.isPrimary) ?? item.product.images?.[0];
              const unitPrice = item.product.salePrice ?? item.product.price;
              return (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="h-11 w-11 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {img ? (
                      <Image src={img.url} alt={item.product.name} width={44} height={44} className="h-full w-full object-cover" unoptimized />
                    ) : (
                      <div className="h-full w-full bg-green-50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                    <p className="text-[11px] text-[#22c55e] font-semibold mt-0.5">
                      {formatCurrency(unitPrice * item.quantity)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={() => item.quantity <= 1 ? removeItem(item.productId) : updateQuantity(item.productId, item.quantity - 1)}
                        className="h-5 w-5 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="h-2.5 w-2.5 text-gray-500" />
                      </button>
                      <span className="text-xs font-semibold text-gray-700 w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-5 w-5 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-2.5 w-2.5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-400 text-gray-300 transition-colors shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Totals + actions */}
      <div className="px-4 py-3 border-t border-gray-100 space-y-3">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Tổng số lượng</span>
          <span className="font-medium text-gray-700">{itemCount} sản phẩm</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Tạm tính</span>
          <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
        </div>
        {!hasFreeShipping && subtotal > 0 && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>Phí vận chuyển</span>
            <span className="font-medium text-gray-700">{formatCurrency(shippingFee)}</span>
          </div>
        )}
        {hasFreeShipping && subtotal > 0 && (
          <p className="text-[11px] text-[#22c55e] font-medium text-center">🎉 Miễn phí vận chuyển!</p>
        )}

        <Separator />

        <Button
          className="w-full h-10 bg-[#16a34a] hover:bg-[#16a34a] text-white rounded-xl font-semibold text-sm shadow-sm"
          disabled={itemCount === 0}
          asChild={itemCount > 0}
        >
          {itemCount > 0 ? (
            <Link href={ROUTES.CHECKOUT}>
              Đặt hàng <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          ) : (
            <span>Đặt hàng</span>
          )}
        </Button>

        {itemCount > 0 && (
          <button
            onClick={clearCart}
            className="w-full h-8 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            <RotateCcw className="h-3 w-3" /> Nhập lại
          </button>
        )}

        {/* Trust badges */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <div className="h-6 w-6 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <Banknote className="h-3.5 w-3.5 text-[#22c55e]" />
            </div>
            Thanh toán khi nhận hàng
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <div className="h-6 w-6 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <Truck className="h-3.5 w-3.5 text-[#22c55e]" />
            </div>
            Giao hàng nhanh 30–60 phút
          </div>
        </div>
      </div>
    </div>
  );
}
