export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, createdResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, NotFoundError, AppError } from "@/lib/api-error";
import { z } from "zod";

const addToCartSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive().max(100),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const cart = await db.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return successResponse(cart ?? { items: [] });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const body = await req.json();
    const { productId, quantity } = addToCartSchema.parse(body);

    const product = await db.product.findUnique({
      where: { id: productId, status: "ACTIVE" },
    });
    if (!product) throw new NotFoundError("Sản phẩm");
    if (product.stock < quantity) {
      throw new AppError(`Chỉ còn ${product.stock} sản phẩm trong kho`, 400);
    }

    let cart = await db.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await db.cart.create({ data: { userId: session.user.id } });
    }

    const cartItem = await db.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity },
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });

    return createdResponse(cartItem, "Đã thêm vào giỏ hàng");
  } catch (error) {
    return handleApiError(error);
  }
}
