import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Đăng nhập</h1>
        <p className="text-sm text-muted-foreground">
          Nhập thông tin tài khoản để tiếp tục
        </p>
      </div>
      {/* LoginForm will be implemented in Phase 2 */}
    </div>
  );
}
