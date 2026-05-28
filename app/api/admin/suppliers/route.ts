import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

function adminGuard(s: Session | null) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

const supplierSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const includeInactive = req.nextUrl.searchParams.get("all") === "true";
  const suppliers = await db.supplier.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: { _count: { select: { products: true, batches: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ suppliers });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = supplierSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const supplier = await db.supplier.create({ data: parsed.data });
  return NextResponse.json({ supplier }, { status: 201 });
}
