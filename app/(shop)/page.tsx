import type { Metadata } from "next";
import { APP_CONFIG, REVALIDATE } from "@/constants/config";
import { HeroBanner } from "@/components/home/HeroBanner";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { PromoBanner } from "@/components/home/PromoBanner";

export const revalidate = REVALIDATE.HOME;

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
  description: APP_CONFIG.description,
};

export default function HomePage() {
  return (
    <main>
      <HeroBanner />
      <FeaturesSection />
      <CategorySection />
      <FeaturedProducts />
      <PromoBanner />
    </main>
  );
}
