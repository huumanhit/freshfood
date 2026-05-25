"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/shared/ProductCard";
import { ROUTES } from "@/constants/routes";

interface RelatedProductsProps {
  products: Product[];
  categoryName?: string;
  categorySlug?: string;
}

export function RelatedProducts({ products, categoryName, categorySlug }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#22c55e] uppercase tracking-widest mb-0.5">
            Gợi ý
          </p>
          <h2 className="text-xl font-bold font-display text-gray-900">
            Sản phẩm liên quan
            {categoryName && (
              <span className="text-gray-500 font-normal"> — {categoryName}</span>
            )}
          </h2>
        </div>
        {categorySlug && (
          <Link
            href={ROUTES.CATEGORY(categorySlug)}
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#22c55e] hover:text-[#15803d] transition-colors"
          >
            Xem thêm <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {products.slice(0, 4).map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
