import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, createdResponse, paginatedResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, AppError } from "@/lib/api-error";
import { createOrderSchema } from "@/lib/validations/order";
import { generateOrderNumber } from "@/lib/utils";
import { SHIPPING } from "@/constants/config";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10);
    const skip = (page - 1) * limit;

    const [total, orders] = await Promise.all([
      db.order.count({ where: { userId: session.user.id } }),
      db.order.findMany({
        where: { userId: session.user.id },
        include: {
          items: true,
          address: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return paginatedResponse(orders, {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const body = await req.json();
    const { addressId, paymentMethod, couponCode, note } = createOrderSchema.parse(body);

    // Load cart with items
    const cart = await db.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError("Giỏ hàng trống", 400);
    }

    // Validate stock
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new AppError(
          `Sản phẩm "${item.product.name}" không đủ hàng`,
          400
        );
      }
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => {
      const price =
        item.product.salePrice != null &&
        Number(item.product.salePrice) < Number(item.product.price)
          ? Number(item.product.salePrice)
          : Number(item.product.price);
      return sum + price * item.quantity;
    }, 0);

    // Apply coupon
    let discount = 0;
    let couponId: string | undefined;

    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode.toUpperCase(), isActive: true },
      });
      if (coupon) {
        const now = new Date();
        const valid =
          (!coupon.startsAt || coupon.startsAt <= now) &&
          (!coupon.expiresAt || coupon.expiresAt >= now) &&
          (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
          (!coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount));

        if (valid) {
          couponId = coupon.id;
          if (coupon.type === "PERCENTAGE") {
            discount = (subtotal * Number(coupon.value)) / 100;
            if (coupon.maxDiscount) {
              discount = Math.min(discount, Number(coupon.maxDiscount));
            }
          } else if (coupon.type === "FIXED_AMOUNT") {
            discount = Number(coupon.value);
          }
        }
      }
    }

    const shippingFee =
      subtotal - discount >= SHIPPING.FREE_SHIPPING_THRESHOLD
        ? 0
        : SHIPPING.DEFAULT_FEE;
    const total = subtotal - discount + shippingFee;

    // Create order in transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session.user.id,
          addressId,
          paymentMethod,
          paymentStatus: "PENDING",
          subtotal,
          shippingFee,
          discount,
          total,
          couponId,
          couponCode: couponCode?.toUpperCase(),
          note,
          items: {
            create: cart.items.map((item) => {
              const price =
                item.product.salePrice != null &&
                Number(item.product.salePrice) < Number(item.product.price)
                  ? Number(item.product.salePrice)
                  : Number(item.product.price);
              return {
                productId: item.productId,
                productName: item.product.name,
                price,
                quantity: item.quantity,
                subtotal: price * item.quantity,
              };
            }),
          },
        },
        include: { items: true, address: true },
      });

      // Decrement stock & increment soldCount
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      // Increment coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    return createdResponse(order, "Đặt hàng thành công");
  } catch (error) {
    return handleApiError(error);
  }
}
