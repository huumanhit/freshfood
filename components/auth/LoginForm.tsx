"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? ROUTES.HOME;

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    setServerError("");
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.error) {
        setServerError("Email hoặc mật khẩu không đúng");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
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
        <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
        <p className="text-sm text-gray-500">Nhập thông tin tài khoản để tiếp tục</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              {...register("email")}
              type="email"
              placeholder="email@example.com"
              className="pl-9 rounded-xl h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22c55e] text-gray-900 placeholder:text-gray-400"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Mật khẩu</Label>
            <span className="text-xs text-gray-400">Quên mật khẩu? Liên hệ admin</span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-9 pr-10 rounded-xl h-11 border-gray-200 bg-gray-50 focus:bg-white focus:border-[#22c55e] text-gray-900 placeholder:text-gray-400"
              autoComplete="current-password"
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
          className="w-full h-11 bg-[#16a34a] hover:bg-[#16a34a] text-white rounded-xl font-semibold text-sm shadow-md shadow-green-100 transition-all hover:shadow-green-200"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Đăng nhập"}
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

      {/* Register link */}
      <p className="text-center text-sm text-gray-500">
        Chưa có tài khoản?{" "}
        <Link href={ROUTES.REGISTER} className="font-semibold text-[#22c55e] hover:text-[#15803d] transition-colors">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
