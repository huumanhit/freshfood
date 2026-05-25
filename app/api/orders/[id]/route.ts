import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from "@/lib/api-error";

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        address: true,
      },
    });

    if (!order) throw new NotFoundError("Đơn hàng");

    if (
      order.userId !== session.user.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "SUPER_ADMIN"
    ) {
      throw new ForbiddenError();
    }

    return successResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}
