"use client";

import { useCartStore } from "@/store/cart-store";
import { CartItem } from "@/types/order";
import { SHIPPING } from "@/constants/config";

export function useCart() {
  const store = useCartStore();

  const subtotal = store.subtotal();
  const itemCount = store.itemCount();
  const shippingFee =
    subtotal >= SHIPPING.FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING.DEFAULT_FEE;
  const total = subtotal + shippingFee;
  const hasFreeShipping = subtotal >= SHIPPING.FREE_SHIPPING_THRESHOLD;
  const freeShippingRemaining = Math.max(
    0,
    SHIPPING.FREE_SHIPPING_THRESHOLD - subtotal
  );

  function isInCart(productId: string, weightOption?: string): boolean {
    return store.items.some((i) => i.productId === productId && i.weightOption === weightOption);
  }

  function getItemQuantity(productId: string, weightOption?: string): number {
    return store.items.find((i) => i.productId === productId && i.weightOption === weightOption)?.quantity ?? 0;
  }

  return {
    ...store,
    subtotal,
    itemCount,
    shippingFee,
    total,
    hasFreeShipping,
    freeShippingRemaining,
    isInCart,
    getItemQuantity,
  };
}
