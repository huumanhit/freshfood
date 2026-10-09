import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { APP_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

const FALLBACK_CATEGORIES = [
  { id: "rau-xanh", name: "Rau xanh", slug: "rau-xanh" },
  { id: "cu-qua", name: "Củ quả", slug: "cu-qua" },
  { id: "thit-heo", name: "Thịt heo", slug: "thit-heo" },
  { id: "thit-bo", name: "Thịt bò", slug: "thit-bo" },
  { id: "ca-hai-san", name: "Cá & Hải sản", slug: "ca-hai-san" },
  { id: "dau-hat-tuoi", name: "Đậu/Hạt tươi", slug: "dau-hat-tuoi" },
];

const getFooterCategories = unstable_cache(
  async () => {
    try {
      const data = await db.category.findMany({
        where: { isActive: true, parentId: null },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: { sortOrder: "asc" },
        take: 8,
      });
      return data.length > 0 ? data : FALLBACK_CATEGORIES;
    } catch {
      return FALLBACK_CATEGORIES;
    }
  },
  ["footer-categories"],
  { revalidate: 300, tags: ["categories"] }
);

const SUPPORT_LINKS = [
  { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
  { label: "Chính sách đổi trả", href: "/chinh-sach-doi-tra" },
  { label: "Chính sách giao hàng", href: "/chinh-sach-giao-hang" },
  { label: "Liên hệ", href: "/lien-he" },
];

const ACCOUNT_LINKS = [
  { label: "Đăng nhập", href: ROUTES.LOGIN },
  { label: "Đăng ký tài khoản", href: ROUTES.REGISTER },
  { label: "Danh sách yêu thích", href: ROUTES.WISHLIST },
  { label: "Hồ sơ cá nhân", href: ROUTES.PROFILE },
];

export async function Footer() {
  const categories = await getFooterCategories();

  return (
    <footer className="bg-green-50 text-gray-600 border-t border-green-100">
      {/* Main grid */}
      <div className="container py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <Link href={ROUTES.HOME} className="inline-flex items-center gap-2">
            <Image src="/logo-mark.png" alt="Logo" width={52} height={52} className="rounded-xl" />
            <span className="font-display font-bold text-xl text-gray-900">
              {APP_CONFIG.name}
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
            Mang thực phẩm sạch, tươi ngon từ nông trại đến bàn ăn của bạn. Chúng
            tôi cam kết chất lượng và sự tươi mới mỗi ngày.
          </p>
          {/* Social */}
          <div className="flex gap-3">
            <SocialIconRaw href={APP_CONFIG.socialLinks.facebook} label="Facebook">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </SocialIconRaw>
            <SocialIconRaw href={APP_CONFIG.socialLinks.instagram} label="Instagram">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
            </SocialIconRaw>
            <SocialIconRaw href={APP_CONFIG.socialLinks.youtube} label="YouTube">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" /></svg>
            </SocialIconRaw>
          </div>
        </div>

        {/* Products */}
        <div className="space-y-4">
          <p className="font-semibold text-sm text-gray-900">Danh mục sản phẩm</p>
          <ul className="space-y-2.5">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={ROUTES.CATEGORY(cat.slug)}
                  className="text-sm text-gray-500 hover:text-[#16a34a] transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-4">
          <p className="font-semibold text-sm text-gray-900">Hỗ trợ khách hàng</p>
          <ul className="space-y-2.5">
            {SUPPORT_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-gray-500 hover:text-[#16a34a] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + Account */}
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="font-semibold text-sm text-gray-900">Liên hệ</p>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-[#16a34a] mt-0.5 shrink-0" />
                <a href={`tel:${APP_CONFIG.phone}`} className="text-gray-600 hover:text-[#16a34a] transition-colors">
                  {APP_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-[#16a34a] mt-0.5 shrink-0" />
                <a href={`mailto:${APP_CONFIG.email}`} className="text-gray-600 hover:text-[#16a34a] transition-colors">
                  {APP_CONFIG.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#16a34a] mt-0.5 shrink-0" />
                <span className="text-gray-600">{APP_CONFIG.address}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-sm text-gray-900">Tài khoản</p>
            <ul className="space-y-2">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-[#16a34a] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-green-100">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialIconRaw({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const hasLink = Boolean(href && href.trim() !== "" && href !== "#");

  if (!hasLink) {
    return (
      <span
        aria-label={label}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700 cursor-default"
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700 hover:bg-[#16a34a] hover:text-white transition-all duration-200"
    >
      {children}
    </a>
  );
}
