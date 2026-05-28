"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  LogOut,
  Truck,
  GitMerge,
  ShoppingCart,
  Gift,
  Layers,
  Settings,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: Tag },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag, showPending: true },
  { href: "/admin/delivery", label: "Giao hàng", icon: Truck },
  { href: "/admin/customers", label: "Khách hàng", icon: Users },
  { href: "/admin/referrals", label: "Giới thiệu", icon: Gift },
  { href: "/admin/merge-orders", label: "Gộp đơn", icon: GitMerge },
  { href: "/admin/shopping-list", label: "Mua hàng", icon: ShoppingCart },
  { href: "/admin/traceability", label: "Truy xuất", icon: Layers },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

const POLL_INTERVAL = 30_000; // 30 seconds

export function AdminSidebar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchPending = async () => {
      try {
        const res = await fetch("/api/admin/orders/pending-count");
        const json = await res.json();
        if (mounted) setPendingCount(json.count ?? 0);
      } catch {
        // silently ignore
      }
    };
    fetchPending();
    const timer = setInterval(fetchPending, POLL_INTERVAL);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <Image src="/logo-mark.png" alt="Logo" width={34} height={34} className="rounded-lg shrink-0 border border-gray-100" />
        <div className="leading-tight">
          <p className="font-bold text-sm text-[#15803d]">FreshFood</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, showPending }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const badge = showPending && pendingCount > 0 ? pendingCount : null;
          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-green-50 text-[#15803d] font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[#22c55e]" : "text-gray-400")} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0 text-gray-400" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
