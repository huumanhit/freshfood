export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { createdResponse, paginatedResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, ForbiddenError } from "@/lib/api-error";
import { createProductSchema, productFilterSchema } from "@/lib/validations/product";
import { generateSlug } from "@/lib/utils";

function requireAdmin(role: string) {
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") throw new ForbiddenError();
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const filter = productFilterSchema.parse(params);
    const { page, limit, search, status, sortBy, sortOrder } = filter;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
        ],
      }),
    };

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { reviews: true, orderItems: true } },
        },
        orderBy: sortBy !== "rating" ? { [sortBy]: sortOrder } : undefined,
        skip,
        take: limit,
      }),
    ]);

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

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const body = await req.json();
    const { images, ...data } = createProductSchema.parse(body);

    const slug = generateSlug(data.name);

    const product = await db.product.create({
      data: {
        ...data,
        slug,
        ...(images && {
          images: { create: images.map((img, i) => ({ ...img, sortOrder: i })) },
        }),
      },
      include: { images: true, category: true },
    });

    revalidateTag("products");
    return createdResponse(product, "Sản phẩm đã được tạo");
  } catch (error) {
    return handleApiError(error);
  }
}
