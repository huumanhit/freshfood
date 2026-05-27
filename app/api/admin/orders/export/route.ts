export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

// ── helpers ─────────────────────────────────────────────────────────────────

function q(value: string | number | null | undefined): string {
  const v = value == null ? "" : String(value);
  // Always quote every field → avoids any ambiguity with commas inside addresses
  return `"${v.replace(/"/g, '""')}"`;
}

function row(...cols: (string | number | null | undefined)[]) {
  return cols.map(q).join(",") + "\r\n";
}

function fmtDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function fmtCurrency(n: number | null | undefined): string {
  if (n == null) return "0";
  return n.toLocaleString("vi-VN");
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
  FAILED: "Thất bại",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán lỗi",
  REFUNDED: "Đã hoàn tiền",
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: "Tiền mặt (COD)",
  BANK_TRANSFER: "Chuyển khoản",
  VNPAY: "VNPay",
  STRIPE: "Stripe",
  MOMO: "MoMo",
};

// ── handler ──────────────────────────────────────────────────────────────────

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
    const status = url.searchParams.get("status") as OrderStatus | null;
    const date = url.searchParams.get("date");  // deliveryDate filter (YYYY-MM-DD)
    const slot = url.searchParams.get("slot");  // deliverySlot filter

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.status = status;
    if (date) where.deliveryDate = date;
    if (slot) where.deliverySlot = slot;
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
        address: {
          select: {
            fullName: true, phone: true,
            street: true, ward: true, district: true, province: true,
          },
        },
        items: {
          select: { productName: true, quantity: true, price: true, subtotal: true },
          orderBy: { productName: "asc" },
        },
      },
      take: 10000,
    });

    // ── Build CSV ─────────────────────────────────────────────────────────
    // UTF-8 BOM + sep= directive so Excel (Vietnamese locale) uses comma as delimiter
    const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
    const SEP_HINT = "sep=,\r\n"; // tells Excel: split by comma, not semicolon

    const header = row(
      "STT",
      "Mã đơn",
      "Ngày đặt",
      "Ngày giao dự kiến",
      "Khung giờ giao",
      // customer
      "Tên khách",
      "Số điện thoại",
      // address
      "Số nhà, đường",
      "Phường/Xã",
      "Quận/Huyện",
      "Tỉnh/Thành phố",
      // order info
      "Trạng thái đơn",
      "Thanh toán",
      "PT thanh toán",
      // amounts
      "Tạm tính (đ)",
      "Phí giao hàng (đ)",
      "Giảm giá (đ)",
      "Tổng tiền (đ)",
      // extras
      "Ghi chú khách",
      "Mã coupon",
      "Địa chỉ mới",
      // items
      "Danh sách sản phẩm",
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataRows: string[] = (orders as any[]).map((o, idx) => {
      const name = o.address?.fullName ?? o.user?.name ?? "";
      const phone = o.address?.phone ?? o.user?.phone ?? "";

      // Items summary: "Cải bó xôi x2, Thịt bò x1"
      const itemsSummary = (o.items as { productName: string; quantity: number }[])
        .map((i) => `${i.productName} x${i.quantity}`)
        .join("; ");

      // Delivery date formatted DD/MM/YYYY
      const deliveryDateFmt = o.deliveryDate
        ? (o.deliveryDate as string).split("-").reverse().join("/")
        : "";

      return row(
        idx + 1,
        o.orderNumber,
        fmtDate(new Date(o.createdAt)),
        deliveryDateFmt,
        o.deliverySlot ?? "",
        name,
        phone,
        o.address?.street ?? "",
        o.address?.ward ?? "",
        o.address?.district ?? "",
        o.address?.province ?? "",
        STATUS_LABELS[o.status as OrderStatus] ?? o.status,
        PAYMENT_STATUS_LABELS[o.paymentStatus as PaymentStatus] ?? o.paymentStatus,
        PAYMENT_METHOD_LABELS[o.paymentMethod as PaymentMethod] ?? o.paymentMethod,
        fmtCurrency(Number(o.subtotal)),
        fmtCurrency(Number(o.shippingFee)),
        fmtCurrency(Number(o.discount)),
        fmtCurrency(Number(o.total)),
        o.note ?? "",
        o.couponCode ?? "",
        o.isNewAddress ? "Có" : "",
        itemsSummary,
      );
    });

    const csvContent = header + dataRows.join("");
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

    const body = Buffer.concat([BOM, Buffer.from(SEP_HINT, "utf-8"), Buffer.from(csvContent, "utf-8")]);

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="donhang_${dateStr}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
