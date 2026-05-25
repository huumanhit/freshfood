export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: "/api/auth/signin",
  AUTH_LOGOUT: "/api/auth/signout",
  AUTH_SESSION: "/api/auth/session",

  // Products
  PRODUCTS: "/api/products",
  PRODUCT: (id: string) => `/api/products/${id}`,

  // Categories
  CATEGORIES: "/api/categories",
  CATEGORY: (id: string) => `/api/categories/${id}`,

  // Cart
  CART: "/api/cart",
  CART_ITEM: (itemId: string) => `/api/cart/${itemId}`,

  // Orders
  ORDERS: "/api/orders",
  ORDER: (id: string) => `/api/orders/${id}`,

  // Reviews
  REVIEWS: "/api/reviews",
  REVIEW: (id: string) => `/api/reviews/${id}`,

  // Wishlist
  WISHLIST: "/api/wishlist",
  WISHLIST_ITEM: (productId: string) => `/api/wishlist/${productId}`,

  // Coupon
  COUPONS_APPLY: "/api/coupons/apply",

  // Upload
  UPLOAD: "/api/upload",

  // User
  PROFILE: "/api/user/profile",
  ADDRESSES: "/api/user/addresses",
  ADDRESS: (id: string) => `/api/user/addresses/${id}`,

  // Admin
  ADMIN_PRODUCTS: "/api/admin/products",
  ADMIN_PRODUCT: (id: string) => `/api/admin/products/${id}`,
  ADMIN_CATEGORIES: "/api/admin/categories",
  ADMIN_CATEGORY: (id: string) => `/api/admin/categories/${id}`,
  ADMIN_ORDERS: "/api/admin/orders",
  ADMIN_ORDER: (id: string) => `/api/admin/orders/${id}`,
  ADMIN_USERS: "/api/admin/users",
  ADMIN_USER: (id: string) => `/api/admin/users/${id}`,
  ADMIN_COUPONS: "/api/admin/coupons",
  ADMIN_COUPON: (id: string) => `/api/admin/coupons/${id}`,
  ADMIN_BANNERS: "/api/admin/banners",
  ADMIN_BANNER: (id: string) => `/api/admin/banners/${id}`,
  ADMIN_STATS: "/api/admin/stats",
} as const;
