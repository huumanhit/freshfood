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
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between bg-fresh-700 p-12 text-white">
        <div className="text-2xl font-display font-bold">{APP_CONFIG.name}</div>
        <blockquote className="space-y-2">
          <p className="text-xl leading-relaxed">
            &ldquo;{APP_CONFIG.tagline}&rdquo;
          </p>
          <footer className="text-fresh-200 text-sm">
            Giao hàng trong 2 giờ — 7 ngày mỗi tuần
          </footer>
        </blockquote>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
