"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingCart, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: ROUTES.HOME, label: "Trang chủ", icon: Home },
  { href: ROUTES.PRODUCTS, label: "Sản phẩm", icon: Package },
  { href: ROUTES.CART, label: "Giỏ hàng", icon: ShoppingCart, isCart: true },
  { href: ROUTES.PROFILE, label: "Tài khoản", icon: User, isAuth: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, toggleCart } = useCart();
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon, isCart, isAuth }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));

          if (isCart) {
            return (
              <button
                key={href}
                onClick={toggleCart}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative"
              >
                <div className="relative">
                  <ShoppingCart className={cn("h-5 w-5", active ? "text-[#22c55e]" : "text-gray-400")} />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        key="badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-[#22c55e] text-[9px] font-bold text-white px-0.5"
                      >
                        {itemCount > 9 ? "9+" : itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className={cn("text-[10px] font-medium", active ? "text-[#22c55e]" : "text-gray-400")}>
                  {label}
                </span>
              </button>
            );
          }

          const linkHref = isAuth && !isAuthenticated ? ROUTES.LOGIN : href;

          return (
            <Link
              key={href}
              href={linkHref}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative"
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#22c55e]"
                />
              )}
              <Icon className={cn("h-5 w-5", active ? "text-[#22c55e]" : "text-gray-400")} />
              <span className={cn("text-[10px] font-medium", active ? "text-[#22c55e]" : "text-gray-400")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
