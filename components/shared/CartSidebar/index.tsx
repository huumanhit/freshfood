"use client";

import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Minus, Plus, ArrowRight, PackageOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { SHIPPING } from "@/constants/config";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    shippingFee,
    total,
    itemCount,
    hasFreeShipping,
    freeShippingRemaining,
  } = useCart();

  const progressPct = Math.min(
    100,
    (subtotal / SHIPPING.FREE_SHIPPING_THRESHOLD) * 100
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-gray-100">
          <SheetTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-100">
              <ShoppingBag className="h-4 w-4 text-[#22c55e]" />
            </div>
            Giỏ hàng
            {itemCount > 0 && (
              <span className="ml-1 rounded-full bg-[#22c55e] px-2 py-0.5 text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <PackageOpen className="h-10 w-10 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">Giỏ hàng trống</p>
              <p className="text-sm text-gray-400 mt-1">
                Hãy thêm thực phẩm tươi ngon vào giỏ nhé!
              </p>
            </div>
            <Button
              className="bg-[#22c55e] hover:bg-[#16a34a] rounded-xl"
              onClick={closeCart}
              asChild
            >
              <Link href={ROUTES.PRODUCTS}>
                Mua sắm ngay <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="px-5 py-3 bg-green-50 border-b border-green-100">
              {hasFreeShipping ? (
                <p className="text-xs font-medium text-green-700 flex items-center gap-1.5">
                  🎉 Bạn được miễn phí vận chuyển!
                </p>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-500">
                    Thêm{" "}
                    <span className="font-semibold text-[#22c55e]">
                      {formatCurrency(freeShippingRemaining)}
                    </span>{" "}
                    để được miễn phí vận chuyển
                  </p>
                  <div className="h-1.5 rounded-full bg-green-200 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[#22c55e]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <ScrollArea className="flex-1">
              <div className="px-5 py-3 space-y-3">
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const primaryImg = item.product.images?.find((i) => i.isPrimary) ?? item.product.images?.[0];
                    const linePrice =
                      (item.product.salePrice ?? item.product.price) * item.quantity;

                    return (
                      <motion.div
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 py-3 border-b border-gray-50 last:border-0"
                      >
                        {/* Image */}
                        <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {primaryImg ? (
                            <Image
                              src={primaryImg.url}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                              <ShoppingBag className="h-5 w-5 text-green-300" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-400">{item.product.unit}</p>

                          {/* Qty controls */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
                              <button
                                onClick={() =>
                                  item.quantity <= 1
                                    ? removeItem(item.productId)
                                    : updateQuantity(item.productId, item.quantity - 1)
                                }
                                className="flex h-7 w-7 items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                                aria-label="Giảm"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold select-none">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity + 1)
                                }
                                className="flex h-7 w-7 items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                                aria-label="Tăng"
                                disabled={item.quantity >= item.product.stock}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Price + remove */}
                        <div className="flex flex-col items-end justify-between shrink-0">
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-gray-300 hover:text-red-400 transition-colors"
                            aria-label="Xóa"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <p className="text-sm font-bold text-[#22c55e]">
                            {formatCurrency(linePrice)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 space-y-4 bg-white">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Tạm tính ({itemCount} sản phẩm)</span>
                  <span className="text-gray-700">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Phí vận chuyển</span>
                  <span className={hasFreeShipping ? "text-[#22c55e] font-medium" : "text-gray-700"}>
                    {hasFreeShipping ? "Miễn phí" : formatCurrency(shippingFee)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Tổng cộng</span>
                  <span className="text-[#22c55e] text-lg">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                className="w-full h-11 bg-[#22c55e] hover:bg-[#16a34a] rounded-xl font-semibold text-base shadow-md shadow-green-200"
                asChild
                onClick={closeCart}
              >
                <Link href={ROUTES.CHECKOUT}>
                  Thanh toán ngay <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl border-gray-200"
                asChild
                onClick={closeCart}
              >
                <Link href={ROUTES.CART}>Xem giỏ hàng</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
