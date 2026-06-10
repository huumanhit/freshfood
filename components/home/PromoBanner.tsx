"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, ArrowRight, Clock } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { SHIPPING } from "@/constants/config";
import { formatCurrency } from "@/lib/utils";

export function PromoBanner() {
  return (
    <section className="py-10 bg-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#15803d] via-[#16a34a] to-[#22c55e] p-8 md:p-10"
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white mb-3">
                <Tag className="h-3.5 w-3.5" />
                Ưu đãi đặc biệt
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-white leading-tight mb-2">
                Miễn phí vận chuyển
                <br />
                <span className="text-green-200">
                  cho đơn từ {formatCurrency(SHIPPING.FREE_SHIPPING_THRESHOLD)}
                </span>
              </h3>
              <p className="text-sm text-green-100">
                Áp dụng toàn bộ sản phẩm · Giao hàng nội thành TP.HCM
              </p>
            </div>

            {/* Right: highlights */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-4 text-center min-w-[120px]">
                <Clock className="h-6 w-6 text-green-200 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">Ngày mai</p>
                <p className="text-xs text-green-200">Nhận hàng</p>
              </div>
              <div className="rounded-2xl bg-white/15 backdrop-blur-sm p-4 text-center min-w-[120px]">
                <Tag className="h-6 w-6 text-green-200 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">-20%</p>
                <p className="text-xs text-green-200">Đơn đầu tiên</p>
              </div>

              <Link
                href={ROUTES.PRODUCTS}
                className="self-center inline-flex items-center gap-2 rounded-2xl bg-white text-[#15803d] font-semibold px-6 py-3 text-sm hover:bg-green-50 transition-colors shadow-lg whitespace-nowrap"
              >
                Mua ngay <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
