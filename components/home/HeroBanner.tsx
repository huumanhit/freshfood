"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Leaf, ChefHat, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

const SLIDES = [
  {
    headline: "Thực phẩm",
    cursive: "Sạch – Tươi – An toàn",
    sub: "Rau, thịt, cá... được làm sạch sẵn,\nchọn lọc kỹ càng, giao tận nơi nhanh chóng!",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&h=500&fit=crop&q=80",
  },
  {
    headline: "Nông sản",
    cursive: "Tươi từ Vườn – Đến Bàn",
    sub: "Rau củ quả sạch VietGAP, hái sáng giao trưa,\ngiữ trọn vitamin và hương vị tự nhiên.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&h=500&fit=crop&q=80",
  },
  {
    headline: "Hải sản",
    cursive: "Tươi Sống – Giao Nhanh",
    sub: "Tôm, cá, mực tươi sống đánh bắt trong ngày,\nbảo quản lạnh, giao tận nhà trong 2–3h.",
    image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=700&h=500&fit=crop&q=80",
  },
];

const BADGES = [
  { icon: Leaf,    label: "Sạch 100%",      sub: "Không hóa chất" },
  { icon: ChefHat, label: "Chế biến",        sub: "Sạch sẽ" },
  { icon: Truck,   label: "Giao hàng",       sub: "Nhanh chóng" },
];

export function HeroBanner() {
  const [active, setActive] = useState(0);
  const slide = SLIDES[active];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#eafaf0] via-[#f4fdf6] to-[#e8f8ee]">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-green-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />

      <div className="container relative z-10 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-8 items-center">

          {/* ── Left ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="space-y-5 text-center lg:text-left"
            >
              {/* Headline */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                  {slide.headline}
                </h1>
                <p className="text-3xl sm:text-4xl font-bold text-[#22c55e]"
                   style={{ fontFamily: "'Dancing Script', 'Segoe Script', cursive" }}>
                  {slide.cursive}
                </p>
              </div>

              {/* Sub */}
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed whitespace-pre-line max-w-sm mx-auto lg:mx-0">
                {slide.sub}
              </p>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {BADGES.map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-green-100"
                  >
                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-800 leading-none">{label}</p>
                      <p className="text-[11px] text-gray-500 leading-none mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-2xl px-7 h-12 font-semibold shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5 transition-all"
                  asChild
                >
                  <Link href={ROUTES.PRODUCTS}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Đặt hàng ngay
                  </Link>
                </Button>
              </div>

              {/* Dots */}
              <div className="flex gap-2 justify-center lg:justify-start pt-1">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === active
                        ? "w-6 h-2 bg-[#22c55e]"
                        : "w-2 h-2 bg-gray-300 hover:bg-green-300"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Right: food image ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active + "-img"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-green-200/50 aspect-[4/3]">
                <Image
                  src={slide.image}
                  alt={slide.headline}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-tl from-green-900/10 via-transparent to-transparent" />
              </div>

              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-4 -left-5 bg-white rounded-2xl shadow-xl border border-green-50 px-4 py-3 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Cam kết tươi sạch</p>
                  <p className="text-[11px] text-gray-500">Hoàn tiền nếu không hài lòng</p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
