export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { paginatedResponse, createdResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, ForbiddenError } from "@/lib/api-error";
import { OrderStatus } from "@prisma/client";
import { generateOrderNumber } from "@/lib/utils";
import { SHIPPING } from "@/constants/config";
import { z } from "zod";

function requireAdmin(role: string) {
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") throw new ForbiddenError();
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 20);
    const status = req.nextUrl.searchParams.get("status") as OrderStatus | null;
    const search = req.nextUrl.searchParams.get("search") ?? "";
    const newAddress = req.nextUrl.searchParams.get("newAddress") === "true";
    const date = req.nextUrl.searchParams.get("date") ?? "";
    const slot = req.nextUrl.searchParams.get("slot") ?? "";
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(newAddress && { isNewAddress: true }),
      ...(date && { deliveryDate: date }),
      ...(slot && { deliverySlot: slot }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
          { address: { phone: { contains: search } } },
        ],
      }),
    };

    const [total, orders] = await Promise.all([
      db.order.count({ where }),
      db.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          address: true,
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return paginatedResponse(orders, {
      page, limit, total, totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ── POST: admin tạo đơn thủ công ─────────────────────────────────────────────
const manualOrderSchema = z.object({
  phone: z.string().min(9),
  fullName: z.string().min(1),
  province: z.string().min(1),
  district: z.string().min(1),
  ward: z.string().min(1),
  street: z.string().min(1),
  deliverySlot: z.string().optional(),
  deliveryDate: z.string().optional(),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "VNPAY", "MOMO", "STRIPE"]).default("COD"),
  paymentStatus: z.enum(["PENDING", "PAID"]).default("PENDING"),
  note: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number().int().min(1),
    price: z.number().positive(),
  })).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();
    requireAdmin(session.user.role);

    const body = await req.json();
    const {
      phone, fullName, province, district, ward, street,
      deliverySlot, deliveryDate, paymentMethod, paymentStatus,
      note, items,
    } = manualOrderSchema.parse(body);

    // Find or create user by phone
    let user = await db.user.findFirst({ where: { phone } });
    if (!user) {
      const email = `${phone.replace(/\D/g, "")}@guest.freshfood.vn`;
      user = await db.user.upsert({
        where: { email },
        update: { name: fullName, phone },
        create: { name: fullName, phone, email, role: "USER" },
      });
    }

    const address = await db.address.create({
      data: { userId: user.id, fullName, phone, province, district, ward, street, isDefault: false },
    });

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = subtotal >= SHIPPING.FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING.DEFAULT_FEE;
    const total = subtotal + shippingFee;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = await db.$transaction(async (tx: any) => {
      const o = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user!.id,
          addressId: address.id,
          paymentMethod, paymentStatus,
          status: "CONFIRMED",
          subtotal, shippingFee, discount: 0, total,
          note: note || null,
          deliverySlot: deliverySlot || null,
          deliveryDate: deliveryDate || null,
          isNewAddress: false,
        },
        select: { id: true, orderNumber: true },
      });

      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: o.id,
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          },
        });
      }

      return o;
    });

    return createdResponse({ orderId: order.id, orderNumber: order.orderNumber }, "Tạo đơn thành công");
  } catch (error) {
    return handleApiError(error);
  }
}
