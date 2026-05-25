import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";

export async function GET(_req: NextRequest) {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { products: true } } },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    return successResponse(categories);
  } catch (error) {
    return handleApiError(error);
  }
}
