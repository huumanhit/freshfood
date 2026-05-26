import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

function adminGuard(s: Awaited<ReturnType<typeof auth>>) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

const batchSchema = z.object({
  batchCode: z.string().min(1).max(100),
  productId: z.string(),
  supplierId: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(20),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  purchasePrice: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const productId = req.nextUrl.searchParams.get("productId") ?? "";
  const status = req.nextUrl.searchParams.get("status") ?? "";
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? "1"));
  const limit = 20;

  const where = {
    ...(productId && { productId }),
    ...(status && { status: status as never }),
  };

  const [batches, total] = await Promise.all([
    db.productBatch.findMany({
      where,
      include: {
        product: { select: { name: true, unit: true } },
        supplier: { select: { name: true } },
        _count: { select: { traceabilityLogs: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    db.productBatch.count({ where }),
  ]);

  return NextResponse.json({
    batches: batches.map((b) => ({
      ...b,
      quantity: Number(b.quantity),
      purchasePrice: b.purchasePrice ? Number(b.purchasePrice) : null,
    })),
    total,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = batchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const batch = await db.$transaction(async (tx) => {
    const b = await tx.productBatch.create({ data: parsed.data });
    await tx.traceabilityLog.create({
      data: {
        batchId: b.id,
        event: "RECEIVED",
        notes: `Nhập lô ${b.batchCode}`,
        performedBy: session!.user.id,
      },
    });
    return b;
  });

  return NextResponse.json({
    batch: { ...batch, quantity: Number(batch.quantity), purchasePrice: batch.purchasePrice ? Number(batch.purchasePrice) : null },
  }, { status: 201 });
}
