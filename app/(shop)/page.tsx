import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";
import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HeroBanner } from "@/components/home/HeroBanner";
import { HomeMiniCart } from "@/components/home/HomeMiniCart";
import { PromoBanner } from "@/components/home/PromoBanner";
import { ROUTES } from "@/constants/routes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
  description: APP_CONFIG.description,
};

export default function HomePage() {
  return (
    <main className="bg-white">
      <HeroBanner />

      {/* Search bar — mobile only */}
      <div className="lg:hidden px-3 py-3">
        <Link
          href={ROUTES.PRODUCTS}
          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
        >
          <span className="flex-1 text-sm text-gray-400">Tìm sản phẩm...</span>
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
        </Link>
      </div>

      {/* Categories */}
      <CategorySection />

      {/* Featured products */}
      <section className="bg-white px-3 pb-6 lg:py-14">
        <div className="lg:container lg:grid lg:grid-cols-[1fr_300px] lg:gap-6 lg:items-start">
          <FeaturedProducts />
          <div className="hidden lg:block">
            <HomeMiniCart />
          </div>
        </div>
      </section>

      <PromoBanner />
    </main>
  );
}
