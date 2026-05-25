import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(100),
    email: z.string().email("Email không hợp lệ"),
    phone: z
      .string()
      .regex(/^(0[3-9][0-9]{8})$/, "Số điện thoại không hợp lệ")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Cần ít nhất 1 chữ số"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
    newPassword: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Cần ít nhất 1 chữ số"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z
    .string()
    .regex(/^(0[3-9][0-9]{8})$/, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
});

export const addressSchema = z.object({
  fullName: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  phone: z.string().regex(/^(0[3-9][0-9]{8})$/, "Số điện thoại không hợp lệ"),
  province: z.string().min(1, "Chọn tỉnh/thành phố"),
  district: z.string().min(1, "Chọn quận/huyện"),
  ward: z.string().min(1, "Chọn phường/xã"),
  street: z.string().min(5, "Địa chỉ tối thiểu 5 ký tự"),
  isDefault: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
