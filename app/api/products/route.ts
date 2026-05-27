export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { paginatedResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";
import { productFilterSchema } from "@/lib/validations/product";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const filter = productFilterSchema.parse(params);

    const {
      page,
      limit,
      search,
      categorySlug,
      minPrice,
      maxPrice,
      isOrganic,
      isFeatured,
      status,
      sortBy,
      sortOrder,
    } = filter;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: status ?? "ACTIVE",
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { tags: { contains: search, mode: "insensitive" } },
        ],
      }),
      // Only filter by category if slug is valid and active
      ...(categorySlug && {
        category: { slug: categorySlug, isActive: true },
      }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      ...(isOrganic !== undefined && { isOrganic }),
      ...(isFeatured !== undefined && { isFeatured }),
    };

    const orderBy =
      sortBy === "rating"
        ? undefined
        : { [sortBy]: sortOrder };

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true, name: true, slug: true,
          price: true, salePrice: true,
          stock: true, unit: true, origin: true,
          status: true, isOrganic: true, isFeatured: true,
          categoryId: true,
          createdAt: true, updatedAt: true,
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return paginatedResponse(products, {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
