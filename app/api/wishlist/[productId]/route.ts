export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { noContentResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError } from "@/lib/api-error";

interface RouteParams {
  params: { productId: string };
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    await db.wishlist.deleteMany({
      where: { userId: session.user.id, productId: params.productId },
    });

    return noContentResponse();
  } catch (error) {
    return handleApiError(error);
  }
}
