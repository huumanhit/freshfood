"use client";

import { motion } from "framer-motion";
import { Truck, Leaf, Banknote, RefreshCcw } from "lucide-react";

const FEATURES = [
  {
    icon: Truck,
    title: "Giao hàng ngày mai",
    description: "Đặt trước 22h hôm nay — nhận hàng tươi ngon tận nhà vào ngày mai.",
    gradient: "from-blue-50 to-sky-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: Leaf,
    title: "Thực phẩm tươi sạch",
    description: "Tuyển chọn kỹ lưỡng, rõ nguồn gốc, đảm bảo vệ sinh an toàn thực phẩm.",
    gradient: "from-green-50 to-emerald-100",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    icon: Banknote,
    title: "Thanh toán COD",
    description: "Trả tiền khi nhận hàng, không cần thanh toán trước, an toàn tiện lợi.",
    gradient: "from-amber-50 to-yellow-100",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    icon: RefreshCcw,
    title: "Đổi trả trong 24h",
    description: "Hàng không tươi đổi ngay, không cần giải thích, hoàn tiền trong 24 giờ.",
    gradient: "from-purple-50 to-violet-100",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function FeaturesSection() {
  return (
    <section className="py-14 bg-white">
      <div className="container">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-[#22c55e] uppercase tracking-widest mb-1">
            Cam kết
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-gray-900">
            Tại sao chọn FreshFood?
          </h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={cardVariant}
                className={`group rounded-2xl bg-gradient-to-b ${feat.gradient} border border-white/80 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feat.iconBg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`h-6 w-6 ${feat.iconColor}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
