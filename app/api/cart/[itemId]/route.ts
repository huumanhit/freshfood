import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, noContentResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, NotFoundError } from "@/lib/api-error";
import { z } from "zod";

interface RouteParams {
  params: { itemId: string };
}

const updateCartSchema = z.object({
  quantity: z.number().int().positive().max(100),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const body = await req.json();
    const { quantity } = updateCartSchema.parse(body);

    const item = await db.cartItem.findUnique({
      where: { id: params.itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== session.user.id) {
      throw new NotFoundError("Cart item");
    }

    const updated = await db.cartItem.update({
      where: { id: params.itemId },
      data: { quantity },
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

    const item = await db.cartItem.findUnique({
      where: { id: params.itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== session.user.id) {
      throw new NotFoundError("Cart item");
    }

    await db.cartItem.delete({ where: { id: params.itemId } });

    return noContentResponse();
  } catch (error) {
    return handleApiError(error);
  }
}
