import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

function adminGuard(s: Awaited<ReturnType<typeof auth>>) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

const noteSchema = z.object({
  content: z.string().min(1).max(1000),
  category: z.enum(["GENERAL", "COMPLAINT", "PREFERENCE", "RISK", "SPECIAL"]).default("GENERAL"),
  isImportant: z.boolean().default(false),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const notes = await db.customerNote.findMany({
    where: { userId: params.id },
    orderBy: [{ isImportant: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ notes });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const note = await db.customerNote.create({
    data: {
      userId: params.id,
      content: parsed.data.content,
      category: parsed.data.category,
      isImportant: parsed.data.isImportant,
      createdById: session!.user.id,
    },
  });
  return NextResponse.json({ note }, { status: 201 });
}
