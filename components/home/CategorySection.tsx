"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import { ROUTES } from "@/constants/routes";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function CategorySection() {
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
          {MOCK_CATEGORIES.map((cat) => (
            <motion.div key={cat.id} variants={cardVariant}>
              <Link
                href={ROUTES.CATEGORY(cat.slug)}
                className={`group flex flex-col items-center justify-center gap-3.5 rounded-2xl bg-gradient-to-b ${cat.gradient} border border-white/60 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5`}
              >
                {/* Icon circle */}
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white/70 shadow-sm ring-1 ring-white/80 group-hover:bg-white/90 transition-colors duration-300">
                  <span className="text-3xl leading-none transition-transform duration-300 group-hover:scale-110 drop-shadow-sm">
                    {cat.emoji}
                  </span>
                </div>

                {/* Name only */}
                <p className={`font-semibold text-sm text-center leading-tight ${cat.textColor}`}>
                  {cat.name}
                </p>
              </Link>
            </motion.div>
          ))}
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
