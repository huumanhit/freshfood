"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="relative mb-6">
        <div className="h-24 w-24 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
          <ShoppingCart className="h-12 w-12 text-[#22c55e]/50" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
      <p className="text-gray-400 text-sm mb-8 max-w-xs">
        Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm tươi ngon của chúng tôi!
      </p>

      <Button
        asChild
        className="rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white px-8 h-11"
      >
        <Link href={ROUTES.PRODUCTS}>Mua sắm ngay</Link>
      </Button>
    </motion.div>
  );
}
