"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Truck, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { HERO_STATS } from "@/lib/mock-data";

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=320&h=320&fit=crop&q=80",
    alt: "Rau củ tươi",
    delay: 0.1,
  },
  {
    src: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=320&h=320&fit=crop&q=80",
    alt: "Tôm sú tươi",
    delay: 0.2,
  },
  {
    src: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=320&h=320&fit=crop&q=80",
    alt: "Thịt bò tươi",
    delay: 0.15,
  },
  {
    src: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=320&h=320&fit=crop&q=80",
    alt: "Cà chua cherry",
    delay: 0.25,
  },
];

const TRUST_ITEMS = [
  { icon: Leaf, text: "100% hữu cơ, không hóa chất" },
  { icon: Truck, text: "Giao hàng trong 2–3 giờ" },
  { icon: ShieldCheck, text: "Cam kết hoàn tiền nếu không tươi" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f0fdf4] via-[#f7fdf8] to-[#ecfdf5]">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-green-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />

      <div className="container relative z-10 py-16 md:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* ── Left content ── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 border border-green-200 px-4 py-1.5 text-sm font-medium text-green-700">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Thực phẩm đạt chuẩn VietGAP & GlobalGAP
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-tight tracking-tight text-gray-900"
            >
              Thực phẩm{" "}
              <span className="text-[#22c55e]">sạch</span>
              <br />
              Tươi · An toàn
              <br />
              <span className="text-[#15803d]">Mỗi ngày</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={item}
              className="text-base sm:text-lg text-gray-500 max-w-md mx-auto lg:mx-0 leading-relaxed"
            >
              Chúng tôi kết nối trực tiếp với nông trại sạch, mang thực phẩm
              tươi ngon đến tận tay bạn trong vòng{" "}
              <span className="font-semibold text-gray-700">2–3 giờ</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-2xl px-8 h-12 text-base font-semibold shadow-lg shadow-green-200 transition-all hover:shadow-green-300 hover:-translate-y-0.5"
                asChild
              >
                <Link href={ROUTES.PRODUCTS}>
                  Đặt hàng ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl px-8 h-12 text-base border-2 border-green-200 text-green-700 hover:bg-green-50 transition-all"
                asChild
              >
                <Link href={ROUTES.PRODUCTS}>Xem sản phẩm</Link>
              </Button>
            </motion.div>

            {/* Trust items */}
            <motion.ul variants={item} className="space-y-2">
              {TRUST_ITEMS.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-2 text-sm text-gray-600 justify-center lg:justify-start"
                >
                  <Icon className="h-4 w-4 text-[#22c55e] shrink-0" />
                  {text}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* ── Right: food image grid ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              {HERO_IMAGES.map((img, i) => (
                <motion.div
                  key={img.src}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: img.delay + 0.3 }}
                  whileHover={{ scale: 1.04 }}
                  className={`relative overflow-hidden rounded-2xl shadow-lg ${
                    i === 0 ? "col-span-1 row-span-1" : ""
                  }`}
                >
                  <div className="aspect-square w-full bg-green-50">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={320}
                      height={320}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                  {/* Overlay label */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="inline-block rounded-lg bg-white/90 backdrop-blur-sm px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
                      {img.alt}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-xl p-3 border border-green-100 flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">Cam kết tươi sạch</p>
                <p className="text-[11px] text-gray-500">Hoàn tiền nếu không hài lòng</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center rounded-2xl bg-white/70 border border-green-100 backdrop-blur-sm py-4 px-2 shadow-sm"
            >
              <span className="text-2xl sm:text-3xl font-bold font-display text-[#22c55e]">
                {stat.value}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
