import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const createOrderSchema = z.object({
  addressId: z.string().cuid("Địa chỉ không hợp lệ"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  couponCode: z.string().max(50).optional(),
  note: z.string().max(500).optional(),
});

export const DELIVERY_SLOTS = [
  { value: "06:00-07:00", label: "6:00 – 7:00" },
  { value: "07:00-08:00", label: "7:00 – 8:00" },
  { value: "08:00-09:00", label: "8:00 – 9:00" },
  { value: "09:00-10:00", label: "9:00 – 10:00" },
  { value: "10:00-11:00", label: "10:00 – 11:00" },
  { value: "16:00-17:00", label: "16:00 – 17:00" },
  { value: "17:00-18:00", label: "17:00 – 18:00" },
  { value: "18:00-19:00", label: "18:00 – 19:00" },
  { value: "19:00-20:00", label: "19:00 – 20:00" },
] as const;

export type DeliverySlotValue = (typeof DELIVERY_SLOTS)[number]["value"];

const phoneRegex = /^(0|\+84)[3-9]\d{8}$/;

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự").max(100),
  phone: z.string().regex(phoneRegex, "Số điện thoại không hợp lệ"),
  province: z.string().min(1, "Vui lòng chọn tỉnh/thành"),
  district: z.string().default(""),
  ward: z.string().min(1, "Vui lòng chọn phường/xã"),
  street: z.string().min(5, "Địa chỉ tối thiểu 5 ký tự").max(255),
  lat: z.number().optional(),
  lng: z.number().optional(),
  mapLink: z.string().url().optional().or(z.literal("")),
  deliverySlot: z.string().min(1, "Vui lòng chọn khung giờ giao"),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER"]),
  note: z.string().max(500).optional(),
  referralPhone: z
    .string()
    .regex(phoneRegex, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),
  consentGiven: z.boolean().refine((v) => v === true, "Bạn cần đồng ý với điều khoản"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

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
