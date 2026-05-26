import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

function adminGuard(s: Awaited<ReturnType<typeof auth>>) {
  return s?.user && (s.user.role === "ADMIN" || s.user.role === "SUPER_ADMIN");
}

const updateSchema = z.object({
  status: z.enum(["ACTIVE", "DEPLETED", "EXPIRED_BATCH", "RECALLED"]).optional(),
  notes: z.string().max(500).optional(),
  event: z.enum(["INSPECTED", "STORED", "PICKED", "PACKED", "DELIVERED", "RETURNED", "RECALLED"]).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const batch = await db.productBatch.findUnique({
    where: { id: params.id },
    include: {
      product: { select: { id: true, name: true, unit: true } },
      supplier: true,
      traceabilityLogs: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!batch) return NextResponse.json({ error: "Không tìm thấy lô hàng" }, { status: 404 });

  return NextResponse.json({
    batch: {
      ...batch,
      quantity: Number(batch.quantity),
      purchasePrice: batch.purchasePrice ? Number(batch.purchasePrice) : null,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!adminGuard(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const { status, notes, event } = parsed.data;

  await db.$transaction(async (tx) => {
    if (status) {
      await tx.productBatch.update({ where: { id: params.id }, data: { status } });
    }
    if (event) {
      await tx.traceabilityLog.create({
        data: {
          batchId: params.id,
          event,
          notes: notes ?? null,
          performedBy: session!.user.id,
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
