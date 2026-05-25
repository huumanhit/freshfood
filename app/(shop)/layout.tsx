import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { CartSidebar } from "@/components/shared/CartSidebar";

interface ShopLayoutProps {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartSidebar />
    </div>
  );
}
