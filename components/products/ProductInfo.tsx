"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Zap, Star, MapPin, Package, Tag, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";
import { CartItem } from "@/types/order";
import { formatCurrency, getDiscountPercentage, getProductPrice, cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { WishlistButton } from "@/components/products/WishlistButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";

interface ProductInfoProps {
  product: Product & {
    category?: { id: string; name: string; slug: string };
    _count?: { reviews: number };
  };
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { addItem, openCart, isInCart, getItemQuantity } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const currentPrice = getProductPrice(product.price, product.salePrice ?? null);
  const hasDiscount = product.salePrice != null && product.salePrice < product.price;
  const discountPct = hasDiscount ? getDiscountPercentage(product.price, product.salePrice!) : 0;
  const inCart = isInCart(product.id);
  const cartQty = getItemQuantity(product.id);

  function handleAddToCart() {
    const cartItem: CartItem = {
      id: `cart-${product.id}-${Date.now()}`,
      productId: product.id,
      quantity: qty,
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
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  function handleBuyNow() {
    handleAddToCart();
    openCart();
  }

  return (
    <div className="space-y-5">
      {/* Category breadcrumb */}
      {product.category && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href={ROUTES.HOME} className="hover:text-[#22c55e]">Trang chủ</Link>
          <span>/</span>
          <Link href={ROUTES.CATEGORY(product.category.slug)} className="hover:text-[#22c55e]">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-600 line-clamp-1">{product.name}</span>
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {hasDiscount && (
          <Badge variant="destructive" className="rounded-lg px-2.5 py-1">
            Giảm {discountPct}%
          </Badge>
        )}
        {product.isOrganic && (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 rounded-lg px-2.5 py-1">
            🌿 Hữu cơ (Organic)
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge variant="outline" className="text-red-500 border-red-200 rounded-lg px-2.5 py-1">
            Hết hàng
          </Badge>
        )}
        {product.stock > 0 && product.stock <= 10 && (
          <Badge variant="outline" className="text-amber-500 border-amber-200 rounded-lg px-2.5 py-1">
            Sắp hết — còn {product.stock} {product.unit}
          </Badge>
        )}
      </div>

      {/* Name */}
      <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 leading-snug">
        {product.name}
      </h1>

      {/* Rating row */}
      {(product.reviewCount ?? product._count?.reviews ?? 0) > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.round(product.averageRating ?? 0)
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-200"
                )}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {product.averageRating?.toFixed(1)}
          </span>
          <span className="text-sm text-gray-400">
            ({product.reviewCount ?? product._count?.reviews} đánh giá)
          </span>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-400">
            Đã bán {(product.soldCount ?? 0).toLocaleString("vi-VN")}
          </span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-[#22c55e]">
          {formatCurrency(currentPrice)}
        </span>
        <span className="text-base text-gray-400">/{product.unit}</span>
        {hasDiscount && (
          <span className="text-lg text-gray-400 line-through">
            {formatCurrency(product.price)}
          </span>
        )}
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-3">
        {product.origin && (
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
            <MapPin className="h-4 w-4 text-[#22c55e] shrink-0" />
            <div>
              <p className="text-[11px] text-gray-400">Xuất xứ</p>
              <p className="text-sm font-medium text-gray-700">{product.origin}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
          <Package className="h-4 w-4 text-[#22c55e] shrink-0" />
          <div>
            <p className="text-[11px] text-gray-400">Đơn vị</p>
            <p className="text-sm font-medium text-gray-700">{product.unit}</p>
          </div>
        </div>
        {product.sku && (
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
            <Tag className="h-4 w-4 text-[#22c55e] shrink-0" />
            <div>
              <p className="text-[11px] text-gray-400">Mã SKU</p>
              <p className="text-sm font-medium text-gray-700">{product.sku}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
          <ShoppingCart className="h-4 w-4 text-[#22c55e] shrink-0" />
          <div>
            <p className="text-[11px] text-gray-400">Tồn kho</p>
            <p className={cn("text-sm font-medium", product.stock > 0 ? "text-gray-700" : "text-red-500")}>
              {product.stock > 0 ? `${product.stock} ${product.unit}` : "Hết hàng"}
            </p>
          </div>
        </div>
      </div>

      {/* Short description */}
      {product.shortDescription && (
        <p className="text-sm text-gray-600 leading-relaxed border-l-4 border-[#22c55e] pl-4">
          {product.shortDescription}
        </p>
      )}

      {/* Quantity + cart */}
      {product.stock > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Số lượng:</span>
            <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                aria-label="Giảm"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-base font-semibold select-none">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock}
                className="flex h-10 w-10 items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                aria-label="Tăng"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {inCart && (
              <span className="text-xs text-green-600 font-medium">
                Đã có {cartQty} trong giỏ
              </span>
            )}
          </div>

          <div className="flex gap-3 min-w-0">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              size="lg"
              className={cn(
                "flex-1 min-w-0 h-12 rounded-2xl font-semibold transition-all",
                justAdded
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-[#22c55e] text-[#22c55e] hover:bg-green-50"
              )}
            >
              <AnimatePresence mode="wait">
                {justAdded ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" /> Đã thêm vào giỏ!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" /> Thêm vào giỏ
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
            <Button
              onClick={handleBuyNow}
              size="lg"
              className="flex-1 min-w-0 h-12 rounded-2xl bg-[#16a34a] hover:bg-[#16a34a] font-semibold shadow-md shadow-green-200"
            >
              <Zap className="h-4 w-4 mr-2" />
              Mua ngay
            </Button>
          </div>

          <WishlistButton
            productId={product.id}
            size="lg"
            className="w-full h-10 rounded-2xl border border-gray-200 hover:border-red-200 hover:bg-red-50 bg-white"
          />
        </div>
      )}

      {/* Delivery info strip */}
      <div className="rounded-2xl bg-green-50 border border-green-100 p-4 space-y-2">
        {[
          { icon: "🚚", text: "Giao hàng nhanh nội thành TP.HCM" },
          { icon: "🔄", text: "Đổi trả trong 24h nếu hàng không tươi" },
          { icon: "💰", text: "Thanh toán COD — trả tiền khi nhận hàng" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
