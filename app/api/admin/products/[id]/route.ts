export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";
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

    const updateData = {
      ...data,
      sku: data.sku === "" ? null : data.sku,
      ...(data.name ? { slug: generateSlug(data.name) } : {}),
    };

    let product;
    if (images !== undefined) {
      // Replace images in a transaction: delete all existing, then insert new ones
      product = await db.$transaction(async (tx) => {
        await tx.productImage.deleteMany({ where: { productId: params.id } });
        return tx.product.update({
          where: { id: params.id },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: {
            ...(updateData as any),
            ...(images.length > 0 && {
              images: {
                create: images.map((img, i) => ({ ...img, sortOrder: img.sortOrder ?? i })),
              },
            }),
          },
          include: { images: true, category: true },
        });
      });
    } else {
      product = await db.product.update({
        where: { id: params.id },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: updateData as any,
        include: { images: true, category: true },
      });
    }

    revalidateTag("products");
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

    revalidateTag("products");
    return noContentResponse();
  } catch (error) {
    return handleApiError(error);
  }
}
