"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Plus, Minus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";
import { CartItem } from "@/types/order";
import { formatCurrency, getDiscountPercentage, getProductPrice, cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, openCart, isInCart, getItemQuantity, updateQuantity, removeItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const currentPrice = getProductPrice(product.price, product.salePrice ?? null);
  const hasDiscount = product.salePrice != null && product.salePrice < product.price;
  const discountPct = hasDiscount ? getDiscountPercentage(product.price, product.salePrice!) : 0;
  const inCart = isInCart(product.id);
  const qty = getItemQuantity(product.id);

  function handleAddToCart() {
    const cartItem: CartItem = {
      id: `cart-${product.id}-${Date.now()}`,
      productId: product.id,
      quantity: 1,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice ?? null,
        stock: product.stock,
        unit: product.unit,
        images: product.images?.map((img) => ({ url: img.url, isPrimary: img.isPrimary })) ?? [],
      },
    };
    addItem(cartItem);
    openCart();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  function handleDecrease() {
    if (qty <= 1) removeItem(product.id);
    else updateQuantity(product.id, qty - 1);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Image area */}
      <Link href={ROUTES.PRODUCT_DETAIL(product.slug)} className="block relative aspect-square overflow-hidden bg-gray-50">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            unoptimized
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-green-300" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && !hasDiscount && (
            <Badge className="bg-red-500 text-[11px] px-2 py-0.5 rounded-lg hover:bg-red-600 font-bold tracking-wide">
              HOT
            </Badge>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="text-[11px] px-2 py-0.5 rounded-lg">
              -{discountPct}%
            </Badge>
          )}
          {product.isOrganic && (
            <Badge className="bg-[#16a34a] text-[11px] px-2 py-0.5 rounded-lg hover:bg-[#16a34a]">
              Organic
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
          aria-label="Yêu thích"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="h-4 w-4" />
        </Button>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <Link href={ROUTES.PRODUCT_DETAIL(product.slug)}>
          <h3 className="text-sm font-medium leading-tight line-clamp-2 hover:text-[#22c55e] transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.origin && (
          <p className="text-xs text-gray-400">{product.origin}</p>
        )}

        {/* Rating */}
        {(product.reviewCount ?? 0) > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-500">
              {product.averageRating?.toFixed(1)}{" "}
              <span className="text-gray-400">({product.reviewCount})</span>
            </span>
          </div>
        )}

        {/* Price + button — pinned to bottom */}
        <div className="mt-auto space-y-2">
        {/* Price */}
        <div className="flex items-baseline gap-1 min-w-0">
          <span className="font-bold text-[#22c55e] shrink-0">
            {formatCurrency(currentPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through shrink-0">
              {formatCurrency(product.price)}
            </span>
          )}
          <span className="text-xs text-gray-400 truncate ml-1">/{product.unit}</span>
        </div>

        {/* Add to cart / quantity control */}
        <AnimatePresence mode="wait">
          {inCart ? (
            <motion.div
              key="qty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between rounded-xl border border-[#22c55e] overflow-hidden h-9"
            >
              <button
                onClick={handleDecrease}
                className="flex-1 flex items-center justify-center h-full text-[#22c55e] hover:bg-green-50 transition-colors"
                aria-label="Giảm số lượng"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="px-3 text-sm font-semibold text-gray-800 select-none min-w-[32px] text-center">
                {qty}
              </span>
              <button
                onClick={() => updateQuantity(product.id, qty + 1)}
                className="flex-1 flex items-center justify-center h-full text-[#22c55e] hover:bg-green-50 transition-colors"
                aria-label="Tăng số lượng"
                disabled={qty >= product.stock}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                className={cn(
                  "w-full h-9 text-xs rounded-xl font-medium transition-all duration-200",
                  justAdded
                    ? "bg-green-600 text-white"
                    : "bg-[#16a34a] hover:bg-[#16a34a] text-white shadow-sm hover:shadow-md"
                )}
                disabled={product.stock === 0}
                onClick={handleAddToCart}
                aria-label={`Thêm ${product.name} vào giỏ hàng`}
              >
                {product.stock === 0 ? (
                  "Hết hàng"
                ) : justAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Đã thêm!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                    Thêm vào giỏ
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
