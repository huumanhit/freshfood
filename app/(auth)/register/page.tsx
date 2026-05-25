import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Tạo tài khoản</h1>
        <p className="text-sm text-muted-foreground">
          Đăng ký để trải nghiệm mua sắm tốt hơn
        </p>
      </div>
      {/* RegisterForm will be implemented in Phase 2 */}
    </div>
  );
}
