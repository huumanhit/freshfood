export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

// ── helpers ──────────────────────────────────────────────────────────────────

function esc(v: string | number | null | undefined): string {
  if (v == null) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function td(v: string | number | null | undefined, style?: string): string {
  return `<td${style ? ` style="${style}"` : ""}>${esc(v)}</td>`;
}

// Force text format — prevents Excel from auto-converting phone numbers, dates, etc.
const TEXT = "mso-number-format:'@'";
const NUM  = "mso-number-format:'#,##0'";

function fmtDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:    "Chờ xác nhận",
  CONFIRMED:  "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED:    "Đang giao",
  DELIVERED:  "Đã giao",
  CANCELLED:  "Đã hủy",
  REFUNDED:   "Đã hoàn tiền",
  FAILED:     "Thất bại",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING:  "Chưa thanh toán",
  PAID:     "Đã thanh toán",
  FAILED:   "Thanh toán lỗi",
  REFUNDED: "Đã hoàn tiền",
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD:           "Tiền mặt (COD)",
  BANK_TRANSFER: "Chuyển khoản",
  VNPAY:         "VNPay",
  STRIPE:        "Stripe",
  MOMO:          "MoMo",
};

// ── handler ───────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string })?.role ?? "";
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = req.nextUrl;
    const from   = url.searchParams.get("from");
    const to     = url.searchParams.get("to");
    const status = url.searchParams.get("status") as OrderStatus | null;
    const date   = url.searchParams.get("date");
    const slot   = url.searchParams.get("slot");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.status = status;
    if (date)   where.deliveryDate = date;
    if (slot)   where.deliverySlot = slot;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to)   where.createdAt.lte = new Date(to);
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        address: {
          select: {
            fullName: true, phone: true,
            street: true, ward: true, district: true, province: true,
          },
        },
        items: {
          select: { productName: true, quantity: true },
          orderBy: { productName: "asc" },
        },
      },
      take: 10000,
    });

    // ── Build HTML table (Excel-compatible) ───────────────────────────────
    const COLS = [
      "STT", "Mã đơn", "Ngày đặt", "Ngày giao", "Khung giờ",
      "Tên khách", "Số điện thoại",
      "Số nhà, đường", "Phường/Xã", "Quận/Huyện", "Tỉnh/Thành phố",
      "Trạng thái", "Thanh toán", "PT thanh toán",
      "Tạm tính (đ)", "Phí ship (đ)", "Giảm giá (đ)", "Tổng tiền (đ)",
      "Ghi chú", "Mã coupon", "Địa chỉ mới", "Danh sách sản phẩm",
    ];

    const headerRow = COLS.map((c) =>
      `<th style="background:#16a34a;color:white;font-weight:bold;white-space:nowrap">${esc(c)}</th>`
    ).join("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bodyRows = (orders as any[]).map((o, idx) => {
      const name  = o.address?.fullName ?? o.user?.name ?? "";
      const phone = o.address?.phone ?? o.user?.phone ?? "";

      const itemsSummary = (o.items as { productName: string; quantity: number }[])
        .map((i) => `${i.productName} x${i.quantity}`)
        .join("; ");

      const deliveryDateFmt = o.deliveryDate
        ? (o.deliveryDate as string).split("-").reverse().join("/")
        : "";

      return `<tr>
        ${td(idx + 1)}
        ${td(o.orderNumber, TEXT)}
        ${td(fmtDate(new Date(o.createdAt)), TEXT)}
        ${td(deliveryDateFmt, TEXT)}
        ${td(o.deliverySlot ?? "", TEXT)}
        ${td(name)}
        ${td(phone, TEXT)}
        ${td(o.address?.street ?? "")}
        ${td(o.address?.ward ?? "")}
        ${td(o.address?.district ?? "")}
        ${td(o.address?.province ?? "")}
        ${td(STATUS_LABELS[o.status as OrderStatus] ?? o.status)}
        ${td(PAYMENT_STATUS_LABELS[o.paymentStatus as PaymentStatus] ?? o.paymentStatus)}
        ${td(PAYMENT_METHOD_LABELS[o.paymentMethod as PaymentMethod] ?? o.paymentMethod)}
        ${td(Number(o.subtotal), NUM)}
        ${td(Number(o.shippingFee), NUM)}
        ${td(Number(o.discount), NUM)}
        ${td(Number(o.total), NUM)}
        ${td(o.note ?? "")}
        ${td(o.couponCode ?? "", TEXT)}
        ${td(o.isNewAddress ? "Có" : "")}
        ${td(itemsSummary)}
      </tr>`;
    }).join("\n");

    const today  = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

    const html = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 4px 8px; vertical-align: top; }
    tr:nth-child(even) td { background: #f9fafb; }
  </style>
</head>
<body>
  <table>
    <thead><tr>${headerRow}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=UTF-8",
        "Content-Disposition": `attachment; filename="donhang_${dateStr}.xls"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
