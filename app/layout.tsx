import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Dancing_Script } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { APP_CONFIG } from "@/constants/config";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.url),
  title: {
    default: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  keywords: [
    "tuoingonmoingay", "tươi ngon mỗi ngày",
    "thực phẩm sạch", "rau củ quả tươi", "thịt cá hải sản",
    "thực phẩm hữu cơ", "giao hàng thực phẩm", "thực phẩm sạch tphcm",
    "rau sạch tphcm", "thực phẩm tươi sống",
  ],
  authors: [{ name: APP_CONFIG.name }],
  creator: APP_CONFIG.name,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: APP_CONFIG.url,
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    siteName: APP_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakarta.variable} ${dancingScript.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Tươi Ngon Mỗi Ngày",
              alternateName: ["tuoingonmoingay", "tuoingonmoingay.com"],
              url: "https://tuoingonmoingay.com",
              logo: "https://tuoingonmoingay.com/logo.png",
              description: APP_CONFIG.description,
              address: {
                "@type": "PostalAddress",
                streetAddress: APP_CONFIG.address,
                addressLocality: "TP. Hồ Chí Minh",
                addressCountry: "VN",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: APP_CONFIG.phone,
                contactType: "customer service",
              },
              sameAs: Object.values(APP_CONFIG.socialLinks),
            }),
          }}
        />
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
