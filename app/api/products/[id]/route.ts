export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse } from "@/lib/api-response";
import { handleApiError, NotFoundError } from "@/lib/api-error";

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const product = await db.product.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
        status: "ACTIVE",
      },
      select: {
        id: true, name: true, slug: true,
        description: true, shortDescription: true,
        price: true, salePrice: true,
        sku: true, stock: true, unit: true, weight: true,
        origin: true, status: true,
        isFeatured: true, isOrganic: true,
        categoryId: true,
        metaTitle: true, metaDescription: true, tags: true,
        createdAt: true, updatedAt: true,
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        category: true,
        reviews: {
          where: { isVisible: true },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) throw new NotFoundError("Sản phẩm");

    // Increment view count (fire and forget — silently skipped if column not yet migrated)
    db.$executeRawUnsafe(
      `UPDATE "products" SET "viewCount" = "viewCount" + 1 WHERE "id" = $1`,
      product.id
    ).catch(() => {});

    return successResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
}
