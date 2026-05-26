"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummaryBox } from "@/components/checkout/OrderSummaryBox";
import { AfterHoursNotice } from "@/components/checkout/AfterHoursNotice";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { ROUTES } from "@/constants/routes";

const CUTOFF_HOUR = 21;

function isAfterHours(): boolean {
  return new Date().getHours() >= CUTOFF_HOUR;
}

export default function CheckoutPage() {
  const { itemCount, total } = useCart();
  const [afterHours, setAfterHours] = useState(false);

  useEffect(() => {
    setAfterHours(isAfterHours());
    // Re-check every minute in case the user straddles 21:00
    const interval = setInterval(() => setAfterHours(isAfterHours()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#f7fdf8] min-h-screen">
      <div className="container py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400">
          <Link href={ROUTES.HOME} className="hover:text-[#22c55e] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={ROUTES.CART} className="hover:text-[#22c55e] transition-colors">
            Giỏ hàng
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-600">Thanh toán</span>
        </nav>

        <h1 className="text-2xl font-bold font-display text-gray-900">Đặt hàng</h1>

        {itemCount === 0 ? (
          <EmptyCart />
        ) : afterHours ? (
          <div className="max-w-lg mx-auto py-8">
            <AfterHoursNotice />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CheckoutForm total={total} />
            </div>
            <div className="lg:col-span-1">
              <OrderSummaryBox />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
