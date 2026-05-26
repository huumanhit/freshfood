"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Lỗi đăng ký");
        return;
      }
      // Auto-login after register
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      router.push(ROUTES.HOME);
      router.refresh();
    } catch {
      setServerError("Lỗi hệ thống, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
        <p className="text-sm text-gray-500">Đăng ký để trải nghiệm mua sắm tốt hơn</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Name */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Họ và tên *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              {...register("name")}
              placeholder="Nguyễn Văn A"
              className="pl-9 rounded-xl h-10 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22c55e] text-gray-900 placeholder:text-gray-400"
              autoComplete="name"
            />
          </div>
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              {...register("email")}
              type="email"
              placeholder="email@example.com"
              className="pl-9 rounded-xl h-10 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22c55e] text-gray-900 placeholder:text-gray-400"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Số điện thoại</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              {...register("phone")}
              type="tel"
              placeholder="0901234567"
              className="pl-9 rounded-xl h-10 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22c55e] text-gray-900 placeholder:text-gray-400"
              autoComplete="tel"
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Mật khẩu *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Tối thiểu 8 ký tự, có chữ hoa và số"
              className="pl-9 pr-10 rounded-xl h-10 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22c55e] text-gray-900 placeholder:text-gray-400"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              className="pl-9 pr-10 rounded-xl h-10 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22c55e] text-gray-900 placeholder:text-gray-400"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        {/* Server error */}
        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">{serverError}</p>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl font-semibold text-sm shadow-md shadow-green-100 transition-all hover:shadow-green-200 mt-1"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tạo tài khoản"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">hoặc</span>
        </div>
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-gray-500">
        Đã có tài khoản?{" "}
        <Link href={ROUTES.LOGIN} className="font-semibold text-[#22c55e] hover:text-[#15803d] transition-colors">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
