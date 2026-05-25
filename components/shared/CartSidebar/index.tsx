"use client";

import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Giỏ hàng ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Giỏ hàng trống</p>
            <Button asChild onClick={closeCart}>
              <Link href={ROUTES.PRODUCTS}>Mua sắm ngay</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            {!hasFreeShipping && (
              <p className="text-xs text-muted-foreground bg-muted rounded px-3 py-2">
                Thêm {formatCurrency(freeShippingRemaining)} để được miễn phí vận chuyển
              </p>
            )}

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-1">
                {/* CartItem list — Phase 2 detailed implementation */}
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-16 w-16 rounded-md bg-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.product.unit}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          −
                        </Button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        onClick={() => removeItem(item.productId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <p className="text-sm font-medium">
                        {formatCurrency(
                          (item.product.salePrice ?? item.product.price) * item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-3 pt-4">
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vận chuyển</span>
                  <span>{shippingFee === 0 ? "Miễn phí" : formatCurrency(shippingFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
              <Button className="w-full" size="lg" asChild onClick={closeCart}>
                <Link href={ROUTES.CHECKOUT}>Tiến hành thanh toán</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild onClick={closeCart}>
                <Link href={ROUTES.CART}>Xem giỏ hàng</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
