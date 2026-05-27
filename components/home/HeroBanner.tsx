"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Leaf, ShieldCheck, Truck } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export function HeroBanner() {
  return (
    <>
      {/* ════ MOBILE banner ════ */}
      <div
        className="lg:hidden relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #e8f8ee 0%, #f4fbf7 45%, #eef9f3 100%)",
          minHeight: 340,
        }}
      >
        {/* Leaf deco — top left */}
        <div className="absolute top-0 left-0 pointer-events-none select-none">
          <svg width="72" height="64" viewBox="0 0 72 64" fill="none">
            <ellipse cx="18" cy="46" rx="15" ry="26" fill="#22c55e" opacity="0.32" transform="rotate(-35 18 46)" />
            <ellipse cx="34" cy="36" rx="12" ry="22" fill="#16a34a" opacity="0.22" transform="rotate(-18 34 36)" />
            <ellipse cx="8" cy="28" rx="11" ry="20" fill="#4ade80" opacity="0.28" transform="rotate(-50 8 28)" />
          </svg>
        </div>
        {/* Leaf deco — top right (behind image) */}
        <div className="absolute top-0 right-0 pointer-events-none select-none">
          <svg width="72" height="64" viewBox="0 0 72 64" fill="none">
            <ellipse cx="54" cy="46" rx="15" ry="26" fill="#22c55e" opacity="0.28" transform="rotate(35 54 46)" />
            <ellipse cx="66" cy="28" rx="11" ry="20" fill="#4ade80" opacity="0.22" transform="rotate(15 66 28)" />
          </svg>
        </div>

        {/* Food image — right side, prominent */}
        <div className="absolute right-0 top-0 bottom-0" style={{ width: "48%" }}>
          <Image
            src="/food-hero.jpg"
            alt="Thực phẩm sạch tươi"
            fill
            className="object-cover object-right"
            priority
            unoptimized
            style={{
              maskImage: "linear-gradient(to right, transparent 0%, black 18%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 18%)",
            }}
          />
        </div>

        {/* Text column — left */}
        <div className="relative z-10 px-4 pt-6 pb-5 flex flex-col gap-2" style={{ width: "57%" }}>
          <div>
            <h1 className="font-black text-gray-900 leading-[1.08]" style={{ fontSize: "2.15rem" }}>
              Thực phẩm
            </h1>
            <p
              className="font-bold leading-snug"
              style={{
                fontSize: "1.5rem",
                color: "#16a34a",
                fontFamily: "var(--font-dancing),'Dancing Script',cursive",
              }}
            >
              Sạch – Tươi –<br />An toàn
            </p>
          </div>

          <p className="text-gray-500 leading-relaxed" style={{ fontSize: "0.69rem" }}>
            Rau, thịt, cá... được làm sạch sẵn,<br />
            chọn lọc kỹ càng, giao tận nơi nhanh chóng!
          </p>

          {/* Feature badges */}
          <div className="flex gap-1">
            {[
              { icon: <Leaf className="h-3 w-3 text-green-500" />, bg: "#f0fdf4", top: "Sạch 100%", bot: "Không hóa chất" },
              { icon: <ShieldCheck className="h-3 w-3 text-blue-500" />, bg: "#eff6ff", top: "Chế biến", bot: "sạch sẽ" },
              { icon: <Truck className="h-3 w-3 text-sky-500" />, bg: "#f0f9ff", top: "Giao hàng", bot: "nhanh chóng" },
            ].map((b) => (
              <div
                key={b.top}
                className="flex-1 flex flex-col items-center gap-0.5 rounded-xl border border-white shadow-sm py-1.5"
                style={{ background: b.bg }}
              >
                {b.icon}
                <span className="text-[8px] font-bold text-gray-700 text-center leading-tight mt-0.5">{b.top}</span>
                <span className="text-[8px] text-gray-400 text-center leading-tight">{b.bot}</span>
              </div>
            ))}
          </div>

          {/* CTA button — full width of column */}
          <Link
            href={ROUTES.PRODUCTS}
            className="flex items-center justify-center gap-2 text-white font-bold text-sm rounded-2xl mt-1"
            style={{
              padding: "12px 0",
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              boxShadow: "0 4px 16px rgba(22,163,74,0.42)",
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            Đặt hàng ngay
          </Link>
        </div>
      </div>

      {/* ════ DESKTOP — original two-column ════ */}
      <section
        className="relative overflow-hidden hidden lg:block"
        style={{
          background: "linear-gradient(135deg,#ddf5e6 0%,#eefaf3 22%,#f8fffe 55%,#edf9f2 100%)",
          minHeight: 340,
        }}
      >
        <div className="relative z-10 container mx-auto px-6">
          <div className="flex items-center" style={{ minHeight: 320 }}>
            {/* LEFT */}
            <div
              className="flex-shrink-0 py-10 pr-6 flex flex-col gap-4"
              style={{ width: "clamp(270px, 42%, 440px)" }}
            >
              <div>
                <h1
                  className="font-black text-gray-900 leading-[1.04] mb-0.5"
                  style={{ fontSize: "clamp(2.4rem, 5vw, 3.7rem)" }}
                >
                  Thực phẩm
                </h1>
                <p
                  className="font-bold leading-[1.1]"
                  style={{
                    fontSize: "clamp(1.9rem, 4.2vw, 3rem)",
                    color: "#16a34a",
                    fontFamily: "var(--font-dancing),'Dancing Script',cursive",
                  }}
                >
                  Sạch – Tươi – An toàn
                </p>
              </div>
              <p className="text-gray-500 leading-relaxed text-sm">
                Rau, thịt, cá... được làm sạch sẵn,
                <br />
                chọn lọc kỹ càng, giao tận nơi nhanh chóng!
              </p>
              <div>
                <Link
                  href={ROUTES.PRODUCTS}
                  className="inline-flex items-center gap-2 text-white font-semibold transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    fontSize: "0.875rem",
                    padding: "12px 24px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#22c55e 0%,#16a34a 100%)",
                    boxShadow: "0 4px 18px rgba(22,163,74,0.36)",
                  }}
                >
                  Đặt hàng ngay
                </Link>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex-1 self-stretch relative">
              <div className="absolute inset-0">
                <Image
                  src="/food-hero.jpg"
                  alt="Thực phẩm sạch tươi an toàn"
                  fill
                  className="object-cover object-center"
                  priority
                  unoptimized
                  style={{
                    maskImage:
                      "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 12%,rgba(0,0,0,0.8) 24%,black 36%)",
                    WebkitMaskImage:
                      "linear-gradient(to right,transparent 0%,rgba(0,0,0,0.35) 12%,rgba(0,0,0,0.8) 24%,black 36%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
