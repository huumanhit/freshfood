"use client";

import { useSession } from "next-auth/react";
import { Bell, User } from "lucide-react";

export function AdminTopbar() {
  const { data: session } = useSession();

  return (
    <header className="h-14 shrink-0 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div />

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell className="h-4.5 w-4.5" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <div className="h-8 w-8 rounded-full bg-[#16a34a]/10 flex items-center justify-center">
            <User className="h-4 w-4 text-[#22c55e]" />
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">
              {session?.user?.name ?? "Admin"}
            </p>
            <p className="text-[11px] text-gray-400">
              {session?.user?.role ?? "ADMIN"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
