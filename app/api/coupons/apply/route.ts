export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse } from "@/lib/api-response";
import { handleApiError, UnauthorizedError, AppError } from "@/lib/api-error";
import { applyCouponSchema } from "@/lib/validations/coupon";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) throw new UnauthorizedError();

    const body = await req.json();
    const { code, orderAmount } = applyCouponSchema.parse(body);

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!coupon) throw new AppError("Mã giảm giá không hợp lệ", 404);

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new AppError("Mã giảm giá chưa có hiệu lực", 400);
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new AppError("Mã giảm giá đã hết hạn", 400);
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError("Mã giảm giá đã hết lượt sử dụng", 400);
    }
    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      throw new AppError(
        `Đơn hàng tối thiểu ${Number(coupon.minOrderAmount).toLocaleString("vi-VN")}₫`,
        400
      );
    }

    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = (orderAmount * Number(coupon.value)) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else if (coupon.type === "FIXED_AMOUNT") {
      discount = Number(coupon.value);
    } else if (coupon.type === "FREE_SHIPPING") {
      discount = 0;
    }

    return successResponse({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
      },
      discount,
      isFreeShipping: coupon.type === "FREE_SHIPPING",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
