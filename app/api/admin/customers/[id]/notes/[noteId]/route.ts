import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function adminGuard(s: Session | null) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.customerNote.deleteMany({
    where: { id: params.noteId, userId: params.id },
  });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { isImportant } = await req.json();
  const note = await db.customerNote.update({
    where: { id: params.noteId },
    data: { isImportant },
  });
  return NextResponse.json({ note });
}
