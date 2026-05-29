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
    images: [{ url: `${APP_CONFIG.url}/logo.png`, width: 1200, height: 630, alt: APP_CONFIG.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    images: [`${APP_CONFIG.url}/logo.png`],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
    shortcut: "/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }),
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
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "@id": "https://tuoingonmoingay.com/#business",
                name: "Tươi Ngon Mỗi Ngày",
                alternateName: ["tuoingonmoingay", "Tuoi Ngon Moi Ngay"],
                url: "https://tuoingonmoingay.com",
                logo: "https://tuoingonmoingay.com/logo.png",
                image: "https://tuoingonmoingay.com/logo.png",
                description: APP_CONFIG.description,
                telephone: APP_CONFIG.phone,
                email: APP_CONFIG.email,
                priceRange: "đ–đđđ",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "1/45 Nguyễn Văn Quá, P. Đông Hưng Thuận, Q.12",
                  addressLocality: "TP. Hồ Chí Minh",
                  addressRegion: "Hồ Chí Minh",
                  addressCountry: "VN",
                },
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: 10.8628,
                  longitude: 106.6480,
                },
                openingHoursSpecification: {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
                  opens: "06:00",
                  closes: "21:00",
                },
                servesCuisine: "Thực phẩm sạch, Rau củ quả tươi, Thịt cá hải sản",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": "https://tuoingonmoingay.com/#website",
                name: "Tươi Ngon Mỗi Ngày",
                url: "https://tuoingonmoingay.com",
                description: APP_CONFIG.description,
                inLanguage: "vi",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: "https://tuoingonmoingay.com/products?search={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
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
