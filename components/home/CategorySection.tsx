import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { ROUTES } from "@/constants/routes";
import { CategoryGrid } from "./CategoryGrid";

const getActiveCategories = unstable_cache(
  async () => {
    const result = await db.category.findMany({
      where: { isActive: true, parentId: null },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
      orderBy: { sortOrder: "asc" },
    });
    return result
      .filter((c) => c._count.products > 0)
      .map(({ id, name, slug, image }) => ({ id, name, slug, image: image ?? null }));
  },
  ["active-categories-home"],
  { revalidate: 300, tags: ["categories"] } // 5 phút, clear ngay khi admin thay đổi
);

export async function CategorySection() {
  let categories: { id: string; name: string; slug: string; image: string | null }[] = [];
  try {
    categories = await getActiveCategories();
  } catch {
    // fail silently
  }

  if (categories.length === 0) return null;

  return (
    <section className="bg-white py-3 lg:py-14">
      <div className="container">
        {/* Desktop header */}
        <div className="hidden lg:flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-[#22c55e] uppercase tracking-widest mb-1">
              Danh mục
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-gray-900">
              Mua theo danh mục
            </h2>
          </div>
          <Link
            href={ROUTES.PRODUCTS}
            className="flex items-center gap-1 text-sm font-medium text-[#22c55e] hover:text-[#15803d] transition-colors"
          >
            Tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <CategoryGrid categories={categories} />
      </div>
    </section>
  );
}
