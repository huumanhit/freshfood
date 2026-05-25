import { z } from "zod";
import { CouponType } from "@prisma/client";

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, "Mã chỉ gồm chữ hoa, số, dấu gạch"),
  type: z.nativeEnum(CouponType),
  value: z.number().positive(),
  minOrderAmount: z.number().positive().optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  startsAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1, "Nhập mã giảm giá"),
  orderAmount: z.number().positive(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
