"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ROUTES } from "@/constants/routes";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Visual mapping by keyword in category name
const STYLE_MAP: { keyword: string; emoji: string; gradient: string; textColor: string }[] = [
  { keyword: "rau", emoji: "🥬", gradient: "from-green-50 to-emerald-100", textColor: "text-emerald-700" },
  { keyword: "trái", emoji: "🍊", gradient: "from-orange-50 to-amber-100", textColor: "text-orange-700" },
  { keyword: "thịt", emoji: "🥩", gradient: "from-red-50 to-rose-100", textColor: "text-red-700" },
  { keyword: "hải sản", emoji: "🦐", gradient: "from-blue-50 to-cyan-100", textColor: "text-blue-700" },
  { keyword: "sữa", emoji: "🥛", gradient: "from-yellow-50 to-amber-100", textColor: "text-yellow-700" },
  { keyword: "trứng", emoji: "🥚", gradient: "from-yellow-50 to-orange-100", textColor: "text-yellow-600" },
  { keyword: "ngũ cốc", emoji: "🌾", gradient: "from-amber-50 to-yellow-100", textColor: "text-amber-700" },
  { keyword: "hữu cơ", emoji: "🌿", gradient: "from-green-50 to-teal-100", textColor: "text-green-700" },
  { keyword: "đồ chế biến", emoji: "🍱", gradient: "from-purple-50 to-violet-100", textColor: "text-purple-700" },
  { keyword: "gia vị", emoji: "🧂", gradient: "from-pink-50 to-rose-100", textColor: "text-pink-700" },
];

const DEFAULT_STYLE = { emoji: "🛒", gradient: "from-gray-50 to-slate-100", textColor: "text-gray-700" };

function getStyle(name: string) {
  const lower = name.toLowerCase();
  return STYLE_MAP.find((s) => lower.includes(s.keyword)) ?? DEFAULT_STYLE;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

export function CategorySection() {
  const { data } = useQuery<{ data: Category[] }>({
    queryKey: ["categories-home"],
    queryFn: async () => (await axios.get("/api/categories")).data,
    staleTime: 5 * 60 * 1000,
  });

  const categories = (data?.data ?? []).filter((c) => c._count.products > 0);

  return (
    <section className="py-14 bg-white">
      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-[#22c55e] uppercase tracking-widest mb-1">
              Danh mục
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-gray-900">
              Mua theo danh mục
            </h2>
          </div>
          <Link
            href={ROUTES.PRODUCTS}
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#22c55e] hover:text-[#15803d] transition-colors"
          >
            Tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-28" />
              ))
            : categories.map((cat) => {
                const style = getStyle(cat.name);
                return (
                  <motion.div key={cat.id} variants={cardVariant}>
                    <Link
                      href={ROUTES.CATEGORY(cat.slug)}
                      className={`group flex flex-col items-center justify-center gap-3.5 rounded-2xl bg-gradient-to-b ${style.gradient} border border-white/60 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5`}
                    >
                      <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white/70 shadow-sm ring-1 ring-white/80 group-hover:bg-white/90 transition-colors duration-300">
                        <span className="text-3xl leading-none transition-transform duration-300 group-hover:scale-110 drop-shadow-sm">
                          {style.emoji}
                        </span>
                      </div>
                      <p className={`font-semibold text-sm text-center leading-tight ${style.textColor}`}>
                        {cat.name}
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
        </motion.div>

        {/* Mobile "view all" */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href={ROUTES.PRODUCTS}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#22c55e] hover:text-[#15803d]"
          >
            Xem tất cả danh mục <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
