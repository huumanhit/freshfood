import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const createOrderSchema = z.object({
  addressId: z.string().cuid("Địa chỉ không hợp lệ"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  couponCode: z.string().max(50).optional(),
  note: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  note: z.string().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(5, "Lý do tối thiểu 5 ký tự").max(500),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
