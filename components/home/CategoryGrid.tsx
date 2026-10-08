"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

interface CategoryTheme {
  emoji: string;
  bgGradient: string;
  borderColor: string;
  hoverBorder: string;
  iconBg: string;
  textColor: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  // Thịt heo — sườn heo / thịt heo tươi, tông hồng đào
  "thit-heo": {
    emoji: "🍖",
    bgGradient: "from-rose-50/90 via-pink-50/50 to-rose-100/40",
    borderColor: "border-rose-100/90",
    hoverBorder: "hover:border-rose-300",
    iconBg: "bg-rose-500/10",
    textColor: "text-rose-700",
  },
  // Thịt bò — bít tết bò cẩm thạch đỏ đậm, tông đỏ ruby
  "thit-bo": {
    emoji: "🥩",
    bgGradient: "from-red-50/90 via-rose-50/50 to-red-100/40",
    borderColor: "border-red-100/90",
    hoverBorder: "hover:border-red-300",
    iconBg: "bg-red-500/10",
    textColor: "text-red-700",
  },
  // Thịt gà
  "thit-ga": {
    emoji: "🍗",
    bgGradient: "from-amber-50/90 via-yellow-50/50 to-amber-100/40",
    borderColor: "border-amber-100/90",
    hoverBorder: "hover:border-amber-300",
    iconBg: "bg-amber-500/10",
    textColor: "text-amber-700",
  },
  // Rau xanh
  "rau-xanh": {
    emoji: "🥬",
    bgGradient: "from-emerald-50/90 via-green-50/50 to-emerald-100/40",
    borderColor: "border-emerald-100/90",
    hoverBorder: "hover:border-emerald-300",
    iconBg: "bg-emerald-500/10",
    textColor: "text-emerald-700",
  },
  // Củ quả
  "cu-qua": {
    emoji: "🥕",
    bgGradient: "from-orange-50/90 via-amber-50/50 to-orange-100/40",
    borderColor: "border-orange-100/90",
    hoverBorder: "hover:border-orange-300",
    iconBg: "bg-orange-500/10",
    textColor: "text-orange-700",
  },
  // Cá & Hải sản
  "ca-hai-san": {
    emoji: "🦐",
    bgGradient: "from-sky-50/90 via-cyan-50/50 to-blue-100/40",
    borderColor: "border-sky-100/90",
    hoverBorder: "hover:border-sky-300",
    iconBg: "bg-sky-500/10",
    textColor: "text-sky-700",
  },
  "hai-san": {
    emoji: "🦐",
    bgGradient: "from-sky-50/90 via-cyan-50/50 to-blue-100/40",
    borderColor: "border-sky-100/90",
    hoverBorder: "hover:border-sky-300",
    iconBg: "bg-sky-500/10",
    textColor: "text-sky-700",
  },
  // Đậu / Hạt tươi
  "dau-hat-tuoi": {
    emoji: "🫛",
    bgGradient: "from-lime-50/90 via-emerald-50/50 to-lime-100/40",
    borderColor: "border-lime-100/90",
    hoverBorder: "hover:border-lime-300",
    iconBg: "bg-lime-500/10",
    textColor: "text-lime-700",
  },
  // Rau mầm
  "rau-mam": {
    emoji: "🌱",
    bgGradient: "from-teal-50/90 via-emerald-50/50 to-teal-100/40",
    borderColor: "border-teal-100/90",
    hoverBorder: "hover:border-teal-300",
    iconBg: "bg-teal-500/10",
    textColor: "text-teal-700",
  },
  // Rau củ sơ chế sẵn
  "rau-cu-so-che-san": {
    emoji: "🥗",
    bgGradient: "from-amber-50/90 via-orange-50/50 to-yellow-100/40",
    borderColor: "border-amber-100/90",
    hoverBorder: "hover:border-amber-300",
    iconBg: "bg-amber-500/10",
    textColor: "text-amber-700",
  },
  // Trái cây
  "trai-cay": {
    emoji: "🍎",
    bgGradient: "from-rose-50/90 via-red-50/50 to-rose-100/40",
    borderColor: "border-rose-100/90",
    hoverBorder: "hover:border-rose-300",
    iconBg: "bg-rose-500/10",
    textColor: "text-rose-700",
  },
  // Sữa & Trứng
  "sua-trung": {
    emoji: "🥚",
    bgGradient: "from-amber-50/90 via-yellow-50/50 to-amber-100/40",
    borderColor: "border-amber-100/90",
    hoverBorder: "hover:border-amber-300",
    iconBg: "bg-amber-500/10",
    textColor: "text-amber-700",
  },
};

function getCategoryTheme(slug: string, name: string): CategoryTheme {
  const normSlug = (slug || "").toLowerCase().trim();
  if (CATEGORY_THEMES[normSlug]) {
    return CATEGORY_THEMES[normSlug];
  }

  const lower = (name || "").toLowerCase().trim();
  // Nhận diện theo tên (ưu tiên các loại thịt cụ thể)
  if (lower.includes("bò")) return CATEGORY_THEMES["thit-bo"];
  if (lower.includes("heo") || lower.includes("lợn")) return CATEGORY_THEMES["thit-heo"];
  if (lower.includes("gà") || lower.includes("vịt") || lower.includes("gia cầm")) return CATEGORY_THEMES["thit-ga"];
  if (lower.includes("thịt")) return CATEGORY_THEMES["thit-heo"];

  if (lower.includes("mầm")) return CATEGORY_THEMES["rau-mam"];
  if (lower.includes("sơ chế") || lower.includes("chế biến")) return CATEGORY_THEMES["rau-cu-so-che-san"];
  if (lower.includes("đậu") || lower.includes("hạt")) return CATEGORY_THEMES["dau-hat-tuoi"];
  if (lower.includes("cá") || lower.includes("hải sản") || lower.includes("tôm") || lower.includes("mực")) return CATEGORY_THEMES["ca-hai-san"];
  if (lower.includes("củ") || lower.includes("quả")) return CATEGORY_THEMES["cu-qua"];
  if (lower.includes("rau")) return CATEGORY_THEMES["rau-xanh"];
  if (lower.includes("trái cây") || lower.includes("hoa quả")) return CATEGORY_THEMES["trai-cay"];
  if (lower.includes("trứng") || lower.includes("sữa")) return CATEGORY_THEMES["sua-trung"];

  return {
    emoji: "🛒",
    bgGradient: "from-emerald-50/90 via-green-50/50 to-emerald-100/40",
    borderColor: "border-emerald-100/90",
    hoverBorder: "hover:border-emerald-300",
    iconBg: "bg-emerald-500/10",
    textColor: "text-emerald-700",
  };
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <>
      {/* ── MOBILE: horizontal scroll row ── */}
      <div
        className="lg:hidden flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => {
          const theme = getCategoryTheme(cat.slug, cat.name);
          return (
            <Link
              key={cat.id}
              href={ROUTES.CATEGORY(cat.slug)}
              className="group flex flex-col items-center gap-2 shrink-0 active:scale-95 transition-transform"
            >
              <div
                className={cn(
                  "w-[74px] h-[74px] rounded-2xl border shadow-xs flex items-center justify-center relative overflow-hidden transition-all duration-300",
                  "bg-gradient-to-b group-hover:shadow-md group-hover:-translate-y-0.5",
                  theme.bgGradient,
                  theme.borderColor,
                  theme.hoverBorder
                )}
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={74}
                    height={74}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/70 shadow-xs backdrop-blur-xs transition-transform duration-300 group-hover:scale-110">
                    <span className="text-3xl leading-none select-none">
                      {theme.emoji}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-700 text-center whitespace-nowrap font-semibold max-w-[84px] leading-tight group-hover:text-[#16a34a] transition-colors">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* ── DESKTOP: grid ── */}
      <div className="hidden lg:grid grid-cols-4 gap-5">
        {categories.map((cat) => {
          const theme = getCategoryTheme(cat.slug, cat.name);
          return (
            <Link
              key={cat.id}
              href={ROUTES.CATEGORY(cat.slug)}
              className="group flex flex-col items-center rounded-3xl bg-white border border-gray-100 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div
                className={cn(
                  "w-full aspect-[4/3] overflow-hidden flex items-center justify-center relative transition-colors duration-300",
                  cat.image ? "bg-gray-50" : cn("bg-gradient-to-br", theme.bgGradient)
                )}
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-white/80 shadow-sm backdrop-blur-xs transition-transform duration-500 group-hover:scale-110">
                    <span className="text-5xl leading-none select-none drop-shadow-xs">
                      {theme.emoji}
                    </span>
                  </div>
                )}
              </div>
              <div className="py-3.5 px-3 text-center w-full">
                <p className="font-bold text-sm text-[#14532d] group-hover:text-[#16a34a] transition-colors leading-tight">
                  {cat.name}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
