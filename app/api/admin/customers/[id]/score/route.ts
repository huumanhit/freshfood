import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { upsertCustomerScore } from "@/lib/scoring";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

function adminGuard(s: Session | null) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const result = await upsertCustomerScore(params.id);
  return NextResponse.json({ score: result });
}

const segmentSchema = z.object({
  segment: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = segmentSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  await db.user.update({
    where: { id: params.id },
    data: { segment: parsed.data.segment },
  });
  return NextResponse.json({ ok: true });
}
