"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/home/ProductCardSkeleton";
import { ROUTES } from "@/constants/routes";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "cat-1", label: "Rau củ" },
  { key: "cat-2", label: "Thịt heo" },
  { key: "cat-3", label: "Thịt bò" },
  { key: "cat-4", label: "Hải sản" },
  { key: "cat-5", label: "Thịt gà" },
];

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  const filtered =
    activeTab === "all"
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.categoryId === activeTab);

  function handleTabChange(key: string) {
    setLoading(true);
    setActiveTab(key);
    setTimeout(() => setLoading(false), 400);
  }

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
        <div className="flex gap-2 flex-wrap mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
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

        {/* Product grid */}
        <AnimatePresence mode="wait">
          {loading ? (
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
                <ProductCard key={product.id} product={product} />
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
