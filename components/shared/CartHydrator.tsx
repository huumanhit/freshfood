"use client";

import { useEffect, useRef } from "react";
import axios from "axios";
import { useCartStore } from "@/store/cart-store";

export function CartHydrator() {
  const syncedRef = useRef(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();

    const items = useCartStore.getState().items;
    if (items.length > 0 && !syncedRef.current) {
      syncedRef.current = true;
      const productIds = Array.from(new Set(items.map((i) => i.productId)));
      axios
        .post("/api/cart/validate", { productIds })
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data?.data?.products)) {
            useCartStore.getState().syncItems(res.data.data.products);
          }
        })
        .catch(() => {
          // silently ignore
        });
    }
  }, []);

  return null;
}
