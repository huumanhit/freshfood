export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, noContentResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, ForbiddenError, NotFoundError, AppError } from "@/lib/api-error";
import { z } from "zod";
import { generateSlug } from "@/lib/utils";

interface RouteParams {
  params: { id: string };
}

function requireAdmin(role: string) {
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") throw new ForbiddenError();
}

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const category = await db.category.findUnique({ where: { id: params.id } });
    if (!category) throw new NotFoundError("Danh mục");

    const body = await req.json();
    const data = updateCategorySchema.parse(body);

    const updated = await db.category.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(data.name ? { slug: generateSlug(data.name) } : {}),
      },
      include: { _count: { select: { products: true } } },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const category = await db.category.findUnique({
      where: { id: params.id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundError("Danh mục");

    if (category._count.products > 0) {
      throw new AppError(
        `Danh mục này có ${category._count.products} sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước khi xóa.`,
        400
      );
    }

    await db.category.delete({ where: { id: params.id } });

    return noContentResponse();
  } catch (error) {
    return handleApiError(error);
  }
}
