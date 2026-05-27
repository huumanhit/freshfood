import type { Metadata } from "next";
import Image from "next/image";
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
    <div className="relative min-h-screen flex items-center justify-center">
      {/* ── Full-screen background image ── */}
      <Image
        src="/food-hero.jpg"
        alt="Thực phẩm sạch"
        fill
        className="object-cover object-center"
        priority
        unoptimized
      />

      {/* ── Overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg,rgba(5,50,20,0.55) 0%,rgba(0,30,12,0.45) 50%,rgba(5,40,18,0.60) 100%)",
        }}
      />

      {/* ── Branding top-left ── */}
      <div className="absolute top-6 left-8 z-20 flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        <div className="leading-tight">
          <p className="text-white font-bold text-base drop-shadow">{APP_CONFIG.name}</p>
          <p className="text-green-300 text-xs" style={{ fontFamily: "var(--font-dancing),'Dancing Script',cursive" }}>
            Tươi · Sạch · An toàn
          </p>
        </div>
      </div>

      {/* ── Tagline bottom-left (desktop) ── */}
      <div className="absolute bottom-8 left-8 z-20 hidden lg:block">
        <p
          className="font-black text-white leading-tight mb-1"
          style={{
            fontSize: "clamp(1.5rem, 2.2vw, 2rem)",
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
          }}
        >
          Thực phẩm sạch
        </p>
        <p
          className="font-bold"
          style={{
            fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)",
            color: "#86efac",
            fontFamily: "var(--font-dancing),'Dancing Script',cursive",
            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          Tươi · An toàn · Mỗi ngày
        </p>
        <div className="flex flex-col gap-1.5 mt-3">
          {["100% hữu cơ, không hóa chất", "Giao hàng trong 2–3 giờ", "Cam kết hoàn tiền nếu không tươi"].map((t) => (
            <div key={t} className="flex items-center gap-2 text-xs text-white/80">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="relative z-20 w-full max-w-md mx-4">
        <div
          className="rounded-3xl p-8 sm:p-10"
          style={{
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
