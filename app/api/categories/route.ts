import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";

const getCategories = unstable_cache(
  async () => {
    return db.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { products: true } } },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
  },
  ["categories"],
  { revalidate: 300 } // cache 5 phút
);

export async function GET(_req: NextRequest) {
  try {
    const categories = await getCategories();
    const res = successResponse(categories) as NextResponse;
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
    return res;
  } catch (error) {
    return handleApiError(error);
  }
}
