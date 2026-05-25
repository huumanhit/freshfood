"use client";

import { motion } from "framer-motion";
import { PackageSearch } from "lucide-react";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/home/ProductCardSkeleton";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  columns?: 3 | 4;
}

export function ProductGrid({ products, isLoading, columns = 4 }: ProductGridProps) {
  const gridClass =
    columns === 3
      ? "grid-cols-2 sm:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  if (isLoading) {
    return (
      <div className={`grid ${gridClass} gap-4`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <PackageSearch className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-700 text-lg">Không tìm thấy sản phẩm</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">
          Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm sản phẩm.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`grid ${gridClass} gap-4`}
    >
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
