"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  Phone,
  Heart,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/ui-store";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/constants/routes";
import { APP_CONFIG } from "@/constants/config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Trang chủ", href: ROUTES.HOME },
  { label: "Sản phẩm", href: ROUTES.PRODUCTS },
  { label: "Khuyến mãi", href: ROUTES.PRODUCTS + "?sale=true" },
];

export function Header() {
  const router = useRouter();
  const { toggleMobileMenu, isMobileMenuOpen } = useUIStore();
  const { itemCount, toggleCart } = useCart();
  const { isAuthenticated, isAdmin, user } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <>
      {/* ── Top bar ── */}
      <div className="hidden md:block bg-[#15803d] text-white text-xs py-2">
        <div className="container flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-green-100">
            <Phone className="h-3 w-3" />
            <span>Hotline: </span>
            <a href={`tel:${APP_CONFIG.phone}`} className="font-semibold text-white hover:text-green-200">
              {APP_CONFIG.phone}
            </a>
            <span className="mx-2 text-green-400">·</span>
            <span className="text-green-100">Giao hàng trong 2–3h nội thành TP.HCM</span>
          </div>
          <div className="flex items-center gap-4 text-green-100">
            {!isAuthenticated && (
              <>
                <Link href={ROUTES.LOGIN} className="hover:text-white transition-colors">
                  Đăng nhập
                </Link>
                <Link href={ROUTES.REGISTER} className="hover:text-white transition-colors">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main header ── */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-white transition-shadow duration-300",
          scrolled ? "shadow-md" : "border-b border-gray-100"
        )}
      >
        <div className="container flex h-16 items-center gap-4">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2 font-display font-bold text-xl text-[#15803d] shrink-0"
          >
            <Image src="/logo-mark.png" alt="Logo" width={38} height={38} className="rounded-xl border border-gray-100 shrink-0" />
            <span className="text-base sm:text-xl">{APP_CONFIG.name}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#15803d] hover:bg-green-50 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search bar — desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-sm items-center rounded-xl border border-gray-200 bg-gray-50 hover:border-green-300 focus-within:border-[#22c55e] focus-within:bg-white transition-all overflow-hidden h-9"
          >
            <Search className="ml-3 h-4 w-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm thực phẩm tươi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mr-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Spacer */}
          <div className="flex-1 md:hidden" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-xl"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Tìm kiếm"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex h-9 w-9 rounded-xl"
                aria-label="Yêu thích"
                asChild
              >
                <Link href={ROUTES.WISHLIST}>
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-xl"
              aria-label="Giỏ hàng"
              onClick={toggleCart}
            >
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#16a34a] px-1 text-[10px] font-bold text-white"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* User menu */}
            <div className="relative hidden md:block" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 rounded-xl px-3"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-label="Tài khoản"
              >
                <User className="h-4 w-4" />
                {isAuthenticated && user?.name ? (
                  <span className="text-sm font-medium max-w-[80px] truncate">
                    {user.name.split(" ").slice(-1)[0]}
                  </span>
                ) : (
                  <span className="text-sm font-medium">Tài khoản</span>
                )}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-gray-400 transition-transform",
                    userMenuOpen && "rotate-180"
                  )}
                />
              </Button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-100 overflow-hidden z-50"
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs text-gray-500">Đang đăng nhập</p>
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {user?.name ?? user?.email}
                          </p>
                        </div>
                        <div className="py-1.5">
                          <MenuLink href={ROUTES.PROFILE} icon={User} label="Hồ sơ của tôi" onClick={() => setUserMenuOpen(false)} />
                          <MenuLink href={ROUTES.ORDERS} icon={Package} label="Đơn hàng" onClick={() => setUserMenuOpen(false)} />
                          <MenuLink href={ROUTES.WISHLIST} icon={Heart} label="Yêu thích" onClick={() => setUserMenuOpen(false)} />
                          {isAdmin && (
                            <MenuLink href={ROUTES.ADMIN_DASHBOARD} icon={Settings} label="Quản trị" onClick={() => setUserMenuOpen(false)} />
                          )}
                        </div>
                        <div className="border-t border-gray-100 py-1.5">
                          <button
                            onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: ROUTES.HOME }); }}
                            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-2">
                        <Link
                          href={ROUTES.LOGIN}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#15803d] hover:bg-green-50 transition-colors"
                        >
                          Đăng nhập
                        </Link>
                        <Link
                          href={ROUTES.REGISTER}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Đăng ký tài khoản
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-xl"
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Mobile search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-gray-100 bg-white px-4 py-3"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 h-10">
                <Search className="h-4 w-4 text-gray-400 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Tìm thực phẩm tươi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")}>
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
            >
              <nav className="container py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={toggleMobileMenu}
                    className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#15803d] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
                  {isAuthenticated ? (
                    <>
                      <MobileMenuLink href={ROUTES.PROFILE} label="Hồ sơ" onClick={toggleMobileMenu} />
                      <MobileMenuLink href={ROUTES.ORDERS} label="Đơn hàng" onClick={toggleMobileMenu} />
                      <MobileMenuLink href={ROUTES.WISHLIST} label="Yêu thích" onClick={toggleMobileMenu} />
                      {isAdmin && <MobileMenuLink href={ROUTES.ADMIN_DASHBOARD} label="Quản trị" onClick={toggleMobileMenu} />}
                      <button
                        onClick={() => { toggleMobileMenu(); signOut({ callbackUrl: ROUTES.HOME }); }}
                        className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <MobileMenuLink href={ROUTES.LOGIN} label="Đăng nhập" onClick={toggleMobileMenu} />
                      <MobileMenuLink href={ROUTES.REGISTER} label="Đăng ký" onClick={toggleMobileMenu} />
                    </>
                  )}
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
                    <Phone className="h-4 w-4 text-[#22c55e]" />
                    Hotline: <a href={`tel:${APP_CONFIG.phone}`} className="font-semibold text-[#15803d]">{APP_CONFIG.phone}</a>
                  </div>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mx-1"
    >
      <Icon className="h-4 w-4 text-gray-400" />
      {label}
    </Link>
  );
}

function MobileMenuLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-[#15803d] transition-colors"
    >
      {label}
    </Link>
  );
}
