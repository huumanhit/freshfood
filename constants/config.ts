export const APP_CONFIG = {
  name: "Tươi Ngon Mỗi Ngày",
  tagline: "Thực phẩm sạch, tươi ngon giao tận nhà",
  description: "Tươi Ngon Mỗi Ngày (tuoingonmoingay.com) — cửa hàng thực phẩm sạch, rau củ quả tươi, thịt cá hải sản chất lượng cao, giao hàng nhanh trong 2–3h tại TP.HCM.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://tuoingonmoingay.com",
  email: "tuoingonmoingay@outlook.com",
  phone: "0932133139",
  address: "Chung cư Thái An 1, 1/45 Nguyễn Văn Quá, P. Đông Hưng Thuận, Q.12, TP.HCM",
  socialLinks: {
    facebook: "https://facebook.com/freshfood",
    instagram: "https://instagram.com/freshfood",
    youtube: "https://youtube.com/freshfood",
    tiktok: "https://tiktok.com/@freshfood",
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const;

export const SHIPPING = {
  FREE_SHIPPING_THRESHOLD: 120000,
  DEFAULT_FEE: 15000,
  EXPRESS_FEE: 50000,
} as const;

export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MAX_PRODUCT_IMAGES: 8,
} as const;

export const CACHE_KEYS = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  BANNERS: "banners",
  CART: "cart",
  ORDERS: "orders",
} as const;

export const REVALIDATE = {
  PRODUCTS: 3600,     // 1 hour
  CATEGORIES: 86400,  // 24 hours
  BANNERS: 3600,
  HOME: 1800,         // 30 minutes
} as const;
