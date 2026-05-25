import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, createdResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, AppError } from "@/lib/api-error";
import { z } from "zod";

const createReviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get("productId");
    if (!productId) throw new AppError("productId is required", 400);

    const reviews = await db.review.findMany({
      where: { productId, isVisible: true },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const body = await req.json();
    const { productId, rating, comment } = createReviewSchema.parse(body);

    // Verify purchase
    const hasPurchased = await db.orderItem.findFirst({
      where: {
        productId,
        order: { userId: session.user.id, status: "DELIVERED" },
      },
    });

    const review = await db.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        comment,
        isVerified: !!hasPurchased,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return createdResponse(review, "Cảm ơn đánh giá của bạn");
  } catch (error) {
    return handleApiError(error);
  }
}
