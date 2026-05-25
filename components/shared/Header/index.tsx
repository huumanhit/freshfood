"use client";

import Link from "next/link";
import { ShoppingCart, Search, User, Menu } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/constants/routes";
import { APP_CONFIG } from "@/constants/config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Header() {
  const { toggleMobileMenu } = useUIStore();
  const { itemCount, toggleCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2 font-display font-bold text-xl text-primary">
          {APP_CONFIG.name}
        </Link>

        {/* Desktop nav — placeholder for Phase 2 */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href={ROUTES.PRODUCTS} className="hover:text-primary transition-colors">
            Sản phẩm
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search trigger */}
          <Button variant="ghost" size="icon" aria-label="Tìm kiếm">
            <Search className="h-5 w-5" />
          </Button>

          {/* Cart trigger */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Giỏ hàng"
            onClick={toggleCart}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Button>

          {/* User */}
          <Button variant="ghost" size="icon" aria-label="Tài khoản" asChild>
            <Link href={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN}>
              <User className="h-5 w-5" />
            </Link>
          </Button>

          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
