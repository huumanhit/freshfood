import type { Metadata } from "next";
import { APP_CONFIG } from "@/constants/config";
import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HomeMiniCart } from "@/components/home/HomeMiniCart";
import { PromoBanner } from "@/components/home/PromoBanner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
  description: APP_CONFIG.description,
};

export default function HomePage() {
  return (
    <main>
      {/* Products + inline cart panel — 2-col on large screens */}
      <section className="bg-[#f7fdf8] py-14">
        <div className="container grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          <FeaturedProducts />
          <HomeMiniCart />
        </div>
      </section>
      <CategorySection />
      <PromoBanner />
    </main>
  );
}
