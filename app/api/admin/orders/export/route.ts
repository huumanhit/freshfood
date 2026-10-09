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

function fmtPriceComma(v: number | string | null | undefined): string {
  if (v == null || v === "") return "";
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toLocaleString("en-US");
}

function fmtDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:    "Chờ xác nhận",
  CONFIRMED:  "Đã xác nhận",
  PROCESSING: "Đang soạn hàng",
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

function extractUnitAndWeight(item: {
  productName: string;
  product?: {
    unit?: string | null;
    weight?: unknown;
    weightOptions?: unknown;
  } | null;
}): { productName: string; unitWeight: string } {
  const baseName = item.productName || "";
  const unit = item.product?.unit?.trim() || "";
  const weight = item.product?.weight ? `${Number(item.product.weight)} kg` : "";

  if (item.product?.weightOptions && Array.isArray(item.product.weightOptions)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchedOpt = (item.product.weightOptions as any[]).find(
      (opt) => opt?.name && baseName.endsWith(`(${opt.name})`)
    );
    if (matchedOpt) {
      const clean = baseName.slice(0, baseName.lastIndexOf(`(${matchedOpt.name})`)).trim();
      return {
        productName: clean || baseName,
        unitWeight: matchedOpt.name,
      };
    }
  }

  if (!unit && !weight) {
    const m = baseName.match(/\(([^)]*(?:g|kg|bó|khay|túi|trái|củ|hộp|con|gói|cây)[^)]*)\)$/i);
    if (m) {
      const clean = baseName.slice(0, baseName.lastIndexOf(m[0])).trim();
      return {
        productName: clean || baseName,
        unitWeight: m[1].trim(),
      };
    }
  }

  let finalUnit = unit;
  if (!finalUnit && weight) finalUnit = weight;
  return {
    productName: baseName,
    unitWeight: finalUnit || "—",
  };
}

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
          select: {
            productName: true,
            quantity: true,
            price: true,
            subtotal: true,
            product: {
              select: {
                unit: true,
                weight: true,
                weightOptions: true,
              },
            },
          },
          orderBy: { productName: "asc" },
        },
      },
      take: 10000,
    });

function fmtPayment(method: PaymentMethod, status: PaymentStatus): string {
  if (method === "COD") {
    return status === "PAID" ? "COD (Đã thanh toán)" : "COD (Thu tiền)";
  }
  if (method === "BANK_TRANSFER") {
    return status === "PAID" ? "Chuyển khoản (Đã thanh toán)" : "Chuyển khoản (Chưa thanh toán)";
  }
  const m = PAYMENT_METHOD_LABELS[method] ?? method;
  const s = PAYMENT_STATUS_LABELS[status] ?? status;
  return `${m} (${s})`;
}

    // ── Build HTML table (Excel-compatible) ───────────────────────────────
    const COLS = [
      "STT",
      "Mã đơn",
      "Ngày giao",
      "Khung giờ",
      "Tên sản phẩm",
      "Đơn vị / Trọng lượng",
      "Số lượng",
      "Khách hàng",
      "Số điện thoại",
      "Địa chỉ",
      "Ghi chú",
      "Đơn giá (đ)",
      "Thanh toán",
      "Trạng thái",
    ];

    const headerRow = COLS.map((c) =>
      `<th style="background:#16a34a;color:white;font-weight:bold;white-space:nowrap;padding:6px 10px;border:1px solid #15803d">${esc(c)}</th>`
    ).join("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bodyRows = (orders as any[]).flatMap((o, idx) => {
      const name  = o.address?.fullName ?? o.user?.name ?? "";
      const phone = o.address?.phone ?? o.user?.phone ?? "";

      const deliveryDateFmt = o.deliveryDate
        ? (o.deliveryDate as string).split("-").reverse().join("/")
        : "";

      const deliverySlotFmt = o.deliverySlot
        ? String(o.deliverySlot).replace("-", " – ")
        : "";

      const fullAddress = [
        o.address?.street,
        o.address?.ward,
        o.address?.district,
        o.address?.province,
      ].filter(Boolean).join(", ");

      const items = (o.items && o.items.length > 0) ? o.items : [null];

      return items.map((item: any, itemIdx: number) => {
        const isFirst = itemIdx === 0;

        let cleanName = "";
        let unitWeight = "";
        let qty: number | string = "";

        if (item) {
          const extracted = extractUnitAndWeight(item);
          cleanName = extracted.productName;
          unitWeight = extracted.unitWeight;
          qty = item.quantity;
        }

        return `<tr>
          ${td(idx + 1, "text-align:center")}
          ${td(o.orderNumber, TEXT)}
          ${td(deliveryDateFmt, `${TEXT};text-align:center`)}
          ${td(deliverySlotFmt, `${TEXT};text-align:center`)}
          ${td(cleanName)}
          ${td(unitWeight, `${TEXT};text-align:center`)}
          ${td(qty, "text-align:center")}
          ${td(name)}
          ${td(phone, `${TEXT};text-align:center`)}
          ${td(fullAddress)}
          ${td(isFirst ? (o.note ?? "") : "")}
          ${item?.price != null ? td(fmtPriceComma(item.price), `${TEXT};text-align:right`) : td("")}
          ${td(fmtPayment(o.paymentMethod as PaymentMethod, o.paymentStatus as PaymentStatus), `${TEXT};text-align:center`)}
          ${td(STATUS_LABELS[o.status as OrderStatus] ?? o.status, "text-align:center")}
        </tr>`;
      });
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
    th { background: #16a34a; color: white; font-weight: bold; padding: 6px 10px; border: 1px solid #15803d; white-space: nowrap; text-align: left; }
    td { border: 1px solid #d1d5db; padding: 5px 8px; vertical-align: top; }
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
