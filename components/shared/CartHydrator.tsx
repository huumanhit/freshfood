"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

export function CartHydrator() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);
  return null;
}
