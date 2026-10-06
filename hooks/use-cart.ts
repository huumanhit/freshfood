"use client";

import { useCartStore } from "@/store/cart-store";
import { CartItem } from "@/types/order";
import { SHIPPING } from "@/constants/config";

export function useCart() {
  const store = useCartStore();

  const subtotal = store.subtotal();
  const itemCount = store.itemCount();
  const shippingFee = 0;
  const total = subtotal;
  const hasFreeShipping = false;
  const freeShippingRemaining = 0;

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
