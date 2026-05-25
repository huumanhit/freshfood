import type { Metadata } from "next";
import { APP_CONFIG, REVALIDATE } from "@/constants/config";

export const revalidate = REVALIDATE.HOME;

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
  description: APP_CONFIG.description,
};

export default function HomePage() {
  return (
    <div>
      {/* HeroBanner — Phase 2 */}
      {/* FeaturedCategories — Phase 2 */}
      {/* FeaturedProducts — Phase 2 */}
      {/* PromotionalBanner — Phase 2 */}
      {/* NewArrivals — Phase 2 */}
      {/* Testimonials — Phase 2 */}
    </div>
  );
}
