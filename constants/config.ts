export const APP_CONFIG = {
  name: "FreshFood",
  tagline: "Thực phẩm sạch mỗi ngày",
  description: "Cửa hàng thực phẩm sạch, tươi ngon, giao hàng nhanh tận nơi",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  email: "support@freshfood.vn",
  phone: "1800 9999",
  address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
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
  FREE_SHIPPING_THRESHOLD: 300000,
  DEFAULT_FEE: 30000,
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
