import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, createdResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError } from "@/lib/api-error";
import { z } from "zod";

const addWishlistSchema = z.object({
  productId: z.string().cuid(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const wishlist = await db.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(wishlist);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const body = await req.json();
    const { productId } = addWishlistSchema.parse(body);

    const item = await db.wishlist.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      update: {},
      create: { userId: session.user.id, productId },
    });

    return createdResponse(item, "Đã thêm vào danh sách yêu thích");
  } catch (error) {
    return handleApiError(error);
  }
}
