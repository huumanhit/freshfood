"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  LogOut,
  Leaf,
  Truck,
  GitMerge,
  ShoppingCart,
  Gift,
  Layers,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: Tag },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/delivery", label: "Giao hàng", icon: Truck },
  { href: "/admin/customers", label: "Khách hàng", icon: Users },
  { href: "/admin/referrals", label: "Giới thiệu", icon: Gift },
  { href: "/admin/merge-orders", label: "Gộp đơn", icon: GitMerge },
  { href: "/admin/shopping-list", label: "Mua hàng", icon: ShoppingCart },
  { href: "/admin/traceability", label: "Truy xuất", icon: Layers },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="h-8 w-8 rounded-lg bg-[#22c55e] flex items-center justify-center shrink-0">
          <Leaf className="h-4.5 w-4.5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="font-bold text-sm text-[#15803d]">FreshFood</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-green-50 text-[#15803d] font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[#22c55e]" : "text-gray-400")} />
              {label}
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
