"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CartItem } from "@/types/order";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency, getProductPrice } from "@/lib/utils";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const price = getProductPrice(item.product.price, item.product.salePrice);
  const primaryImage = item.product.images.find((img) => img.isPrimary) ?? item.product.images[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
      className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0"
    >
      {/* Image */}
      <div className="shrink-0 self-start">
        <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={item.product.name}
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="h-full w-full bg-gray-100" />
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
            {item.product.name}
          </p>
          <button
            onClick={() => removeItem(item.id)}
            className="shrink-0 text-gray-300 hover:text-red-400 transition-colors p-0.5 rounded"
            aria-label="Xóa sản phẩm"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>{formatCurrency(price)}</span>
          <span>/</span>
          <span>{item.product.unit}</span>
          {item.product.salePrice != null && item.product.salePrice < item.product.price && (
            <span className="line-through text-gray-300 ml-0.5">
              {formatCurrency(item.product.price)}
            </span>
          )}
        </div>

        {/* Qty controls + subtotal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-3 py-1.5 text-sm font-medium text-gray-800 min-w-[32px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
              disabled={item.quantity >= item.product.stock}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(price * item.quantity)}
          </span>
        </div>

        {item.product.stock <= 5 && item.product.stock > 0 && (
          <p className="text-xs text-orange-500">Chỉ còn {item.product.stock} sản phẩm</p>
        )}
      </div>
    </motion.div>
  );
}

export function CartItemList({ items }: { items: CartItem[] }) {
  return (
    <AnimatePresence mode="popLayout">
      {items.map((item) => (
        <CartItemRow key={item.id} item={item} />
      ))}
    </AnimatePresence>
  );
}
