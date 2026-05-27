import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/constants/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/orders/", "/profile/"],
      },
    ],
    sitemap: `${APP_CONFIG.url}/sitemap.xml`,
  };
}
