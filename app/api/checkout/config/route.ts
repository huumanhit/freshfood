export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_CUTOFF } from "@/lib/business/ordering";

export async function GET() {
  const setting = await db.setting.findUnique({ where: { key: "order_cutoff" } }).catch(() => null);
  return NextResponse.json({ cutoff: setting?.value ?? DEFAULT_CUTOFF });
}
