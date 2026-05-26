import type { Metadata } from "next";
import { APP_CONFIG } from "@/constants/config";

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_CONFIG.name}`,
    default: APP_CONFIG.name,
  },
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#15803d] p-12 text-white">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="text-xl font-bold">{APP_CONFIG.name}</span>
        </div>
        <div className="space-y-4">
          <blockquote className="space-y-3">
            <p className="text-2xl font-bold leading-snug">
              Thực phẩm sạch<br />
              <span className="text-green-200">Tươi · An toàn · Mỗi ngày</span>
            </p>
            <p className="text-green-100 text-sm leading-relaxed">
              Chúng tôi kết nối trực tiếp với nông trại sạch, mang thực phẩm<br />
              tươi ngon đến tận tay bạn trong vòng 2–3 giờ.
            </p>
          </blockquote>
          <div className="flex flex-col gap-2">
            {["100% hữu cơ, không hóa chất", "Giao hàng trong 2–3 giờ", "Cam kết hoàn tiền nếu không tươi"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-green-100">
                <div className="h-1.5 w-1.5 rounded-full bg-green-300 shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
        <p className="text-green-300 text-xs">Giao hàng trong 2 giờ — 7 ngày mỗi tuần</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
