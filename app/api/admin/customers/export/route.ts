export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function escapeCSV(value: string | null | undefined): string {
  const v = value == null ? "" : String(value);
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function row(...cols: (string | null | undefined)[]) {
  return cols.map(escapeCSV).join(",") + "\n";
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string })?.role ?? "";
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const customers = await db.user.findMany({
      where: { role: "USER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        segment: true,
        referralCode: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      take: 50000,
    });

    let csv = "﻿"; // UTF-8 BOM
    csv += row("ID", "Tên", "Email", "SĐT", "Phân khúc", "Mã giới thiệu", "Hoạt động", "Số đơn", "Ngày đăng ký");

    for (const c of customers) {
      csv += row(
        c.id,
        c.name ?? "",
        c.email,
        c.phone ?? "",
        c.segment,
        c.referralCode ?? "",
        c.isActive ? "Có" : "Không",
        String(c._count.orders),
        c.createdAt.toISOString()
      );
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="customers_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
