import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { CartSidebar } from "@/components/shared/CartSidebar";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";

interface ShopLayoutProps {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <CartSidebar />
      <MobileBottomNav />
    </div>
  );
}
