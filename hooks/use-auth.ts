"use client";

import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: session?.user?.role === Role.ADMIN || session?.user?.role === Role.SUPER_ADMIN,
    isSuperAdmin: session?.user?.role === Role.SUPER_ADMIN,
    role: session?.user?.role ?? null,
  };
}
