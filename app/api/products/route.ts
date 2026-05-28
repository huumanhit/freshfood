export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { paginatedResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";
import { productFilterSchema } from "@/lib/validations/product";
import { Prisma } from "@prisma/client";

const queryProducts = unstable_cache(
  async (
    whereJson: string,
    orderByJson: string | null,
    skip: number,
    take: number
  ) => {
    const where = JSON.parse(whereJson) as Prisma.ProductWhereInput;
    const orderBy = orderByJson ? JSON.parse(orderByJson) : undefined;

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true, name: true, slug: true,
          price: true, salePrice: true,
          stock: true, unit: true, origin: true,
          status: true, isOrganic: true, isFeatured: true, isCore: true,
          categoryId: true,
          createdAt: true, updatedAt: true,
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      }),
    ]);

    return {
      total,
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
        salePrice: p.salePrice != null ? Number(p.salePrice) : null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    };
  },
  ["products-list"],
  { revalidate: 60, tags: ["products"] }
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const filter = productFilterSchema.parse(params);

    const {
      page, limit, search, categorySlug,
      minPrice, maxPrice, isOrganic, isFeatured, isCore,
      status, sortBy, sortOrder,
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
      ...(categorySlug && { category: { slug: categorySlug, isActive: true } }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      ...(isOrganic !== undefined && { isOrganic }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(isCore !== undefined && { isCore }),
    };

    const orderBy = sortBy === "rating" ? undefined : { [sortBy]: sortOrder };

    const { total, products } = await queryProducts(
      JSON.stringify(where),
      orderBy ? JSON.stringify(orderBy) : null,
      skip,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    return paginatedResponse(products, {
      page, limit, total, totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
