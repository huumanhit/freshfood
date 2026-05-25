export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { paginatedResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, ForbiddenError } from "@/lib/api-error";
import { OrderStatus } from "@prisma/client";

function requireAdmin(role: string) {
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") throw new ForbiddenError();
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 20);
    const status = req.nextUrl.searchParams.get("status") as OrderStatus | null;
    const search = req.nextUrl.searchParams.get("search") ?? "";
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
        ],
      }),
    };

    const [total, orders] = await Promise.all([
      db.order.count({ where }),
      db.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          address: true,
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return paginatedResponse(orders, {
      page, limit, total, totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
