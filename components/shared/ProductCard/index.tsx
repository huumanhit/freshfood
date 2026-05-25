"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { formatCurrency, getDiscountPercentage, getProductPrice, cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const currentPrice = getProductPrice(product.price, product.salePrice ?? null);
  const hasDiscount = product.salePrice != null && product.salePrice < product.price;
  const discountPct = hasDiscount
    ? getDiscountPercentage(product.price, product.salePrice!)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("group relative rounded-xl border bg-card shadow-sm overflow-hidden", className)}
    >
      {/* Image */}
      <Link href={ROUTES.PRODUCT_DETAIL(product.slug)} className="block aspect-square overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs">
              -{discountPct}%
            </Badge>
          )}
          {product.isOrganic && (
            <Badge className="bg-fresh-600 text-xs">Organic</Badge>
          )}
        </div>

        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Yêu thích"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </Link>

      {/* Info */}
      <div className="p-3 space-y-2">
        <Link href={ROUTES.PRODUCT_DETAIL(product.slug)}>
          <h3 className="text-sm font-medium leading-tight line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.origin && (
          <p className="text-xs text-muted-foreground">{product.origin}</p>
        )}

        {/* Rating */}
        {(product.reviewCount ?? 0) > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs">
              {product.averageRating?.toFixed(1)} ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price + unit */}
        <div className="flex items-baseline gap-1">
          <span className="font-semibold text-primary">
            {formatCurrency(currentPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
          )}
          <span className="text-xs text-muted-foreground">/{product.unit}</span>
        </div>

        {/* Add to cart */}
        <Button
          className="w-full h-8 text-xs"
          disabled={product.stock === 0}
          aria-label={`Thêm ${product.name} vào giỏ hàng`}
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1" />
          {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ"}
        </Button>
      </div>
    </motion.div>
  );
}
