"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Bell, User, Menu, LogOut, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/admin/layout/AdminSidebar";

const POLL_INTERVAL = 30_000;

export function AdminTopbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchPending = async () => {
      try {
        const res = await fetch("/api/admin/orders/pending-count");
        const json = await res.json();
        if (mounted) setPendingCount(json.count ?? 0);
      } catch { /* ignore */ }
    };
    fetchPending();
    const timer = setInterval(fetchPending, POLL_INTERVAL);
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  return (
    <>
      <header className="h-14 shrink-0 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-6">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors relative"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>

        {/* Desktop: empty spacer */}
        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <Bell className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
            <div className="h-8 w-8 rounded-full bg-[#16a34a]/10 flex items-center justify-center">
              <User className="h-4 w-4 text-[#22c55e]" />
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">
                {session?.user?.name ?? "Admin"}
              </p>
              <p className="text-[11px] text-gray-400">{session?.user?.role ?? "ADMIN"}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col" aria-describedby={undefined}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <Image src="/logo-mark.png" alt="Logo" width={32} height={32} className="rounded-lg border border-gray-100" />
              <div className="leading-tight">
                <p className="font-bold text-sm text-[#15803d]">FreshFood</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Admin</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto">
            <SidebarNav pendingCount={pendingCount} onNavigate={() => setMobileOpen(false)} />
          </div>

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
        </SheetContent>
      </Sheet>
    </>
  );
}
