import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin — FreshFood",
    default: "Admin Dashboard",
  },
  robots: { index: false, follow: false },
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      {/* AdminSidebar — Phase 2 */}
      <div className="flex flex-1 flex-col">
        {/* AdminTopbar — Phase 2 */}
        <main className="flex-1 p-6 bg-muted/30">{children}</main>
      </div>
    </div>
  );
}
