export const ROUTES = {
  // Public
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  CATEGORY: (slug: string) => `/category/${slug}`,
  SEARCH: "/search",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // User (protected)
  CART: "/cart",
  CHECKOUT: "/checkout",
  CHECKOUT_SUCCESS: "/checkout/success",
  ORDERS: "/orders",
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  PROFILE: "/profile",
  PROFILE_ADDRESSES: "/profile/addresses",
  WISHLIST: "/wishlist",

  // Admin (protected, role=ADMIN|SUPER_ADMIN)
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_PRODUCT_NEW: "/admin/products/new",
  ADMIN_PRODUCT_EDIT: (id: string) => `/admin/products/${id}`,
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_ORDER_DETAIL: (id: string) => `/admin/orders/${id}`,
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_COUPONS: "/admin/coupons",
  ADMIN_BANNERS: "/admin/banners",
  ADMIN_SETTINGS: "/admin/settings",
} as const;

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const;
export const PROTECTED_ROUTES = [
  ROUTES.CART,
  ROUTES.CHECKOUT,
  ROUTES.ORDERS,
  ROUTES.PROFILE,
  ROUTES.WISHLIST,
] as const;
export const ADMIN_ROUTES_PREFIX = "/admin";
