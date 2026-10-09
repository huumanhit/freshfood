import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/types/order";

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  syncItems: (
    updates: {
      id: string;
      stock?: number;
      price?: number;
      salePrice?: number | null;
      status?: string;
    }[]
  ) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === newItem.id);
          if (existing) {
            const maxStock = newItem.product?.stock;
            const targetQty = existing.quantity + newItem.quantity;
            const finalQty =
              maxStock != null && maxStock > 0
                ? Math.min(targetQty, maxStock)
                : targetQty;
            return {
              items: state.items.map((i) =>
                i.id === newItem.id
                  ? {
                      ...i,
                      quantity: finalQty,
                      product: {
                        ...i.product,
                        ...newItem.product,
                        stock: newItem.product?.stock ?? i.product.stock,
                      },
                    }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id && i.productId !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id === id || i.productId === id) {
              const maxStock = i.product?.stock;
              const clamped =
                maxStock != null && maxStock > 0
                  ? Math.min(quantity, maxStock)
                  : quantity;
              return { ...i, quantity: clamped };
            }
            return i;
          }),
        }));
      },

      syncItems: (updates) => {
        set((state) => ({
          items: state.items
            .filter((item) => {
              const match = updates.find((u) => u.id === item.productId);
              if (match && match.status && match.status !== "ACTIVE") return false;
              return true;
            })
            .map((item) => {
              const match = updates.find((u) => u.id === item.productId);
              if (!match) return item;
              const newStock =
                match.stock !== undefined ? match.stock : item.product.stock;
              const clampedQty =
                newStock > 0 ? Math.min(item.quantity, newStock) : item.quantity;
              return {
                ...item,
                quantity: clampedQty,
                product: {
                  ...item.product,
                  stock: newStock,
                  price:
                    match.price !== undefined ? match.price : item.product.price,
                  salePrice:
                    match.salePrice !== undefined
                      ? match.salePrice
                      : item.product.salePrice,
                },
              };
            }),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => {
          const price =
            i.product.salePrice != null && i.product.salePrice < i.product.price
              ? i.product.salePrice
              : i.product.price;
          return sum + price * i.quantity;
        }, 0),
    }),
    {
      name: "freshfood-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    }
  )
);
