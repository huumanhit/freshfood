export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
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

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string })?.role ?? "";
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = req.nextUrl;
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const status = url.searchParams.get("status");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        address: { select: { fullName: true, phone: true, province: true, district: true, ward: true, street: true } },
        items: { select: { productName: true, quantity: true, price: true, subtotal: true } },
      },
      take: 10000,
    });

    let csv = "﻿"; // UTF-8 BOM for Excel
    csv += row(
      "Mã đơn", "Trạng thái", "Thanh toán", "PT thanh toán",
      "Tên khách", "SĐT", "Email",
      "Địa chỉ", "Tỉnh/Thành",
      "Khung giờ",
      "Tạm tính", "Phí ship", "Giảm giá", "Tổng",
      "Ghi chú khách",
      "Ngày đặt"
    );

    for (const o of orders) {
      const name = o.address?.fullName ?? o.user?.name ?? "";
      const phone = o.address?.phone ?? o.user?.phone ?? "";
      const fullAddr = o.address
        ? `${o.address.street}, ${o.address.ward}, ${o.address.district}`
        : "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oo = o as any;
      csv += row(
        o.orderNumber,
        o.status,
        o.paymentStatus,
        o.paymentMethod,
        name,
        phone,
        o.user?.email ?? "",
        fullAddr,
        o.address?.province ?? "",
        oo.deliverySlot ?? "",
        String(Number(o.subtotal)),
        String(Number(o.shippingFee)),
        String(Number(o.discount)),
        String(Number(o.total)),
        o.note ?? "",
        o.createdAt.toISOString()
      );
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="orders_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
