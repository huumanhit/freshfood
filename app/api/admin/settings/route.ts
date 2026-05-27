export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleApiError, UnauthorizedError, ForbiddenError } from "@/lib/api-error";
import { z } from "zod";

function requireAdmin(role: string) {
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") throw new ForbiddenError();
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const settings = await db.setting.findMany();
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return NextResponse.json({ data: map });
  } catch (error) {
    return handleApiError(error);
  }
}

const patchSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const { key, value } = patchSchema.parse(await req.json());

    const setting = await db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ data: setting });
  } catch (error) {
    return handleApiError(error);
  }
}
