import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function adminGuard(s: Awaited<ReturnType<typeof auth>>) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const search = req.nextUrl.searchParams.get("search") ?? "";
  const segment = req.nextUrl.searchParams.get("segment") ?? "";
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    role: "USER" as const,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search } },
      ],
    }),
    ...(segment && { segment: segment as never }),
  };

  const [customers, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        segment: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
        customerScore: { select: { score: true, tier: true, totalSpent: true, lastOrderAt: true, riskFlags: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({
    customers: customers.map((c) => ({
      ...c,
      customerScore: c.customerScore
        ? { ...c.customerScore, totalSpent: Number(c.customerScore.totalSpent) }
        : null,
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
  });
}
