import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, noContentResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/api-error";
import { updateProductSchema } from "@/lib/validations/product";
import { generateSlug } from "@/lib/utils";

interface RouteParams {
  params: { id: string };
}

function requireAdmin(role: string) {
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") throw new ForbiddenError();
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        category: true,
        _count: { select: { reviews: true, orderItems: true } },
      },
    });

    if (!product) throw new NotFoundError("Sản phẩm");
    return successResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const body = await req.json();
    const { images, ...data } = updateProductSchema.parse(body);

    const existing = await db.product.findUnique({ where: { id: params.id } });
    if (!existing) throw new NotFoundError("Sản phẩm");

    const product = await db.product.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(data.name && { slug: generateSlug(data.name) }),
      },
      include: { images: true, category: true },
    });

    return successResponse(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const product = await db.product.findUnique({ where: { id: params.id } });
    if (!product) throw new NotFoundError("Sản phẩm");

    await db.product.update({
      where: { id: params.id },
      data: { status: "DISCONTINUED" },
    });

    return noContentResponse();
  } catch (error) {
    return handleApiError(error);
  }
}
