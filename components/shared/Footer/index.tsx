import Link from "next/link";
import { APP_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        {/* Brand */}
        <div className="space-y-3">
          <p className="font-display font-bold text-lg text-primary">{APP_CONFIG.name}</p>
          <p className="text-sm text-muted-foreground">{APP_CONFIG.tagline}</p>
          <p className="text-sm text-muted-foreground">{APP_CONFIG.address}</p>
        </div>

        {/* Products */}
        <div className="space-y-3">
          <p className="font-semibold text-sm">Sản phẩm</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href={ROUTES.PRODUCTS} className="hover:text-primary">Tất cả sản phẩm</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-3">
          <p className="font-semibold text-sm">Hỗ trợ</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><p>Hotline: {APP_CONFIG.phone}</p></li>
            <li><p>Email: {APP_CONFIG.email}</p></li>
          </ul>
        </div>

        {/* Account */}
        <div className="space-y-3">
          <p className="font-semibold text-sm">Tài khoản</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href={ROUTES.LOGIN} className="hover:text-primary">Đăng nhập</Link></li>
            <li><Link href={ROUTES.REGISTER} className="hover:text-primary">Đăng ký</Link></li>
            <li><Link href={ROUTES.ORDERS} className="hover:text-primary">Đơn hàng</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
