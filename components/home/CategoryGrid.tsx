"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

const FALLBACK_EMOJI: Record<string, string> = {
  rau:       "🥬",
  "củ":      "🥕",
  thịt:     "🥩",
  "cá":      "🐟",
  "hải sản": "🦐",
};

function getFallbackEmoji(name: string) {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(FALLBACK_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "🛒";
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <>
      {/* ── MOBILE: horizontal scroll row ── */}
      <div
        className="lg:hidden flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={ROUTES.CATEGORY(cat.slug)}
            className="flex flex-col items-center gap-2 shrink-0"
          >
            <div className="w-[72px] h-[72px] rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={72}
                  height={72}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-3xl leading-none">{getFallbackEmoji(cat.name)}</span>
              )}
            </div>
            <span className="text-xs text-gray-700 text-center whitespace-nowrap font-semibold max-w-[80px] leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}

        {/* Tất cả */}
        <Link
          href={ROUTES.PRODUCTS}
          className="flex flex-col items-center gap-2 shrink-0"
        >
          <div className="w-[72px] h-[72px] rounded-2xl bg-[#f0fdf4] border border-green-100 shadow-sm flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#16a34a" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#16a34a" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#16a34a" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#16a34a" />
            </svg>
          </div>
          <span className="text-xs text-[#16a34a] text-center whitespace-nowrap font-semibold">
            Tất cả
          </span>
        </Link>
      </div>

      {/* ── DESKTOP: grid ── */}
      <div className="hidden lg:grid grid-cols-4 gap-5">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={ROUTES.CATEGORY(cat.slug)}
            className="group flex flex-col items-center rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="w-full aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center">
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
                <span className="text-6xl leading-none">{getFallbackEmoji(cat.name)}</span>
              )}
            </div>
            <div className="py-3 px-2 text-center">
              <p className="font-bold text-sm text-[#14532d] group-hover:text-[#16a34a] transition-colors leading-tight">
                {cat.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
