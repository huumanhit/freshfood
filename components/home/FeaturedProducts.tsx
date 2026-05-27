"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/home/ProductCardSkeleton";
import { ROUTES } from "@/constants/routes";
import { Product } from "@/types/product";

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState("all");

  const { data, isLoading } = useProducts({ limit: 8, sortBy: "createdAt", sortOrder: "desc" });
  const products: Product[] = data?.data ?? [];

  // Build tabs dynamically from unique categories in the returned products
  const tabs = useMemo(() => {
    const seen = new Set<string>();
    const cats: { key: string; label: string }[] = [{ key: "all", label: "Tất cả" }];
    for (const p of products) {
      if (p.category && !seen.has(p.category.id)) {
        seen.add(p.category.id);
        cats.push({ key: p.category.id, label: p.category.name });
      }
    }
    return cats;
  }, [products]);

  const filtered = activeTab === "all"
    ? products
    : products.filter((p) => p.category?.id === activeTab);

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-[#22c55e] uppercase tracking-widest mb-1">
            Nổi bật
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-gray-900">
            Sản phẩm nổi bật
          </h2>
        </div>
        <Link
          href={ROUTES.PRODUCTS}
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#22c55e] hover:text-[#15803d] transition-colors"
        >
          Xem tất cả <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Tabs */}
      {!isLoading && tabs.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-[#22c55e] text-white shadow-md shadow-green-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Product grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeletons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="col-span-full flex flex-col items-center justify-center py-16 text-center"
          >
            <span className="text-5xl mb-3">🛒</span>
            <p className="text-gray-500 font-medium">
              Chưa có sản phẩm trong danh mục này
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} className="h-full" />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile CTA */}
      <div className="mt-8 text-center sm:hidden">
        <Link
          href={ROUTES.PRODUCTS}
          className="inline-flex items-center gap-1 text-sm font-medium text-[#22c55e] hover:text-[#15803d]"
        >
          Xem tất cả sản phẩm <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
