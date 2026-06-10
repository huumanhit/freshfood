import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { CartSidebar } from "@/components/shared/CartSidebar";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { CartHydrator } from "@/components/shared/CartHydrator";

interface ShopLayoutProps {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <CartHydrator />
      {/* Announcement bar — server-rendered static HTML, no client JS */}
      <div className="w-full bg-[#16a34a] text-white text-xs sm:text-sm py-2 px-4 text-center font-medium">
        🌿 Đặt trước 22h hôm nay - Nhận hàng tươi ngon ngày mai!&nbsp;
        <a
          href="https://zalo.me/0932133139"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 font-bold hover:text-green-200 transition-colors"
        >
          Hotline/Zalo: 0932 133 139
        </a>
      </div>
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <CartSidebar />
      <MobileBottomNav />
    </div>
  );
}
