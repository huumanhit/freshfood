export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createdResponse } from "@/lib/api-response";
import { handleApiError, AppError } from "@/lib/api-error";
import { checkoutSchema } from "@/lib/validations/order";
import { generateOrderNumber } from "@/lib/utils";
import { SHIPPING } from "@/constants/config";
import { z } from "zod";

const guestCheckoutSchema = checkoutSchema.extend({
  cartItems: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().min(1) }))
    .min(1, "Giỏ hàng trống"),
  couponCode: z.string().max(50).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName, phone, province, district, ward, street,
      lat, lng, mapLink,
      deliverySlot, paymentMethod, note, referralPhone,
      cartItems, couponCode,
      // consentGiven is validated by schema but not stored
    } = guestCheckoutSchema.parse(body);

    // ── 1. Find or create user by phone ──────────────────────────────────────
    let user = await db.user.findFirst({ where: { phone } });
    if (!user) {
      const email = `${phone.replace(/\D/g, "")}@guest.freshfood.vn`;
      user = await db.user.upsert({
        where: { email },
        update: { name: fullName, phone },
        create: { name: fullName, phone, email, role: "USER" },
      });
    } else if (user.name !== fullName) {
      user = await db.user.update({ where: { id: user.id }, data: { name: fullName } });
    }

    // ── 2. Create address ─────────────────────────────────────────────────────
    const address = await db.address.create({
      data: {
        userId: user.id, fullName, phone, province, district, ward, street,
        lat: lat ?? null, lng: lng ?? null, mapLink: mapLink || null,
        isDefault: false,
      },
    });

    // ── 3. Load & validate products ───────────────────────────────────────────
    const products = await db.product.findMany({
      where: { id: { in: cartItems.map((i) => i.productId) }, status: "ACTIVE" },
    });

    if (products.length !== cartItems.length) {
      throw new AppError("Một hoặc nhiều sản phẩm không tồn tại hoặc đã ngừng bán", 400);
    }

    for (const ci of cartItems) {
      const p = products.find((x) => x.id === ci.productId)!;
      if (p.stock < ci.quantity)
        throw new AppError(`"${p.name}" không đủ hàng (còn ${p.stock})`, 400);
    }

    const price = (p: (typeof products)[0]) =>
      p.salePrice != null && Number(p.salePrice) < Number(p.price)
        ? Number(p.salePrice)
        : Number(p.price);

    // ── 4. Totals ─────────────────────────────────────────────────────────────
    const subtotal = cartItems.reduce(
      (s, ci) => s + price(products.find((x) => x.id === ci.productId)!) * ci.quantity,
      0
    );

    let discount = 0;
    let couponId: string | undefined;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode.toUpperCase(), isActive: true },
      });
      if (coupon) {
        const now = new Date();
        const ok =
          (!coupon.startsAt || coupon.startsAt <= now) &&
          (!coupon.expiresAt || coupon.expiresAt >= now) &&
          (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
          (!coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount));
        if (ok) {
          couponId = coupon.id;
          discount =
            coupon.type === "PERCENTAGE"
              ? Math.min((subtotal * Number(coupon.value)) / 100, coupon.maxDiscount ? Number(coupon.maxDiscount) : Infinity)
              : coupon.type === "FIXED_AMOUNT"
              ? Number(coupon.value)
              : 0;
        }
      }
    }

    const shippingFee = subtotal - discount >= SHIPPING.FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING.DEFAULT_FEE;
    const total = subtotal - discount + shippingFee;

    // ── 5. Transaction ────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.$transaction(async (tx: any) => {
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user!.id,
          addressId: address.id,
          paymentMethod,
          paymentStatus: "PENDING",
          subtotal, shippingFee, discount, total,
          couponId: couponId ?? null,
          couponCode: couponCode?.toUpperCase() ?? null,
          note: note || null,
          referralPhone: referralPhone || null,
          deliverySlot: deliverySlot || null,
        },
        select: { id: true, orderNumber: true },
      });

      for (const ci of cartItems) {
        const p = products.find((x) => x.id === ci.productId)!;
        const unitPrice = price(p);
        await tx.orderItem.create({
          data: {
            orderId: order.id, productId: ci.productId,
            productName: p.name, price: unitPrice,
            quantity: ci.quantity, subtotal: unitPrice * ci.quantity,
          },
        });
        await tx.product.update({
          where: { id: ci.productId },
          data: { stock: { decrement: ci.quantity }, soldCount: { increment: ci.quantity } },
        });
      }

      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usageCount: { increment: 1 } } });
      }

      return order;
    });

    return createdResponse(
      { orderId: result.id, orderNumber: result.orderNumber, phone },
      "Đặt hàng thành công"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
