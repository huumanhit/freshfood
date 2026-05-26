export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, createdResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, ForbiddenError } from "@/lib/api-error";
import { z } from "zod";
import { generateSlug } from "@/lib/utils";

function requireAdmin(role: string) {
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") throw new ForbiddenError();
}

const categorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được trống").max(100),
  description: z.string().max(500).optional(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const categories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
        parent: { select: { id: true, name: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return successResponse(categories);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const body = await req.json();
    const data = categorySchema.parse(body);

    const slug = generateSlug(data.name);

    const category = await db.category.create({
      data: { ...data, slug },
      include: { _count: { select: { products: true } } },
    });

    return createdResponse(category, "Danh mục đã được tạo");
  } catch (error) {
    return handleApiError(error);
  }
}
