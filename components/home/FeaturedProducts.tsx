"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/home/ProductCardSkeleton";
import { ROUTES } from "@/constants/routes";
import { Product } from "@/types/product";

export function FeaturedProducts() {
  // Lấy toàn bộ danh mục thực tế từ Database
  const { data: categories = [] } = useCategories();

  // Danh sách tabs từ danh mục (bỏ mục "Tất cả")
  const tabs = categories
    .filter((cat) => (cat._count?.products ?? 1) > 0)
    .map((cat) => ({
      key: cat.slug,
      label: cat.name,
    }));

  const [selectedTab, setSelectedTab] = useState<string>("");
  const activeTab = selectedTab || tabs[0]?.key || "";

  // Truy vấn sản phẩm theo danh mục đang chọn
  const productFilter = {
    limit: 8,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
    categorySlug: activeTab || undefined,
  };

  const { data, isLoading } = useProducts(productFilter);
  const products: Product[] = data?.data ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide lg:text-3xl lg:normal-case lg:tracking-normal lg:font-bold lg:font-display">
          <span className="lg:hidden">Sản phẩm nổi bật</span>
          <span className="hidden lg:block">Sản phẩm nổi bật</span>
        </h2>
        <Link
          href={activeTab ? ROUTES.CATEGORY(activeTab) : ROUTES.PRODUCTS}
          className="flex items-center gap-1 text-sm font-medium text-[#22c55e] hover:text-[#15803d] transition-colors"
        >
          Xem tất cả <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Tabs danh mục (đã bỏ freeship, giới thiệu bạn bè và mục Tất cả để các icon/tab chạy mượt) */}
      {tabs.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                activeTab === tab.key
                  ? "bg-[#16a34a] text-white shadow-md shadow-green-200"
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
            key={`skeletons-${activeTab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            key={`empty-${activeTab}`}
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
            key={`grid-${activeTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} className="h-full" />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile CTA */}
      <div className="mt-8 text-center sm:hidden">
        <Link
          href={activeTab ? ROUTES.CATEGORY(activeTab) : ROUTES.PRODUCTS}
          className="inline-flex items-center gap-1 text-sm font-medium text-[#22c55e] hover:text-[#15803d]"
        >
          Xem thêm trong danh mục <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
