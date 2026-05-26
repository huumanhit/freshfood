import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { ROUTES } from "@/constants/routes";
import { CategoryGrid } from "./CategoryGrid";

export async function CategorySection() {
  let categories: { id: string; name: string; slug: string }[] = [];
  try {
    const result = await db.category.findMany({
      where: { isActive: true, parentId: null },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
      orderBy: { sortOrder: "asc" },
    });
    categories = result
      .filter((c) => c._count.products > 0)
      .map(({ id, name, slug }) => ({ id, name, slug }));
  } catch {
    // fail silently
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-14 bg-white">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
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
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#22c55e] hover:text-[#15803d] transition-colors"
          >
            Tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <CategoryGrid categories={categories} />

        <div className="mt-6 text-center sm:hidden">
          <Link
            href={ROUTES.PRODUCTS}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#22c55e] hover:text-[#15803d]"
          >
            Xem tất cả danh mục <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
