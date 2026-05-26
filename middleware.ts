import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ADMIN_ROUTES_PREFIX } from "@/constants/routes";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  const isAdminRoute = nextUrl.pathname.startsWith(ADMIN_ROUTES_PREFIX);
const isAuthRoute =
    nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    const dest = isAdmin ? "/admin/dashboard" : "/";
    return NextResponse.redirect(new URL(dest, nextUrl));
  }

  // Redirect unauthenticated users from admin routes → login
  if (isAdminRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect non-admin users from admin routes → home
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }


  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons|api/auth).*)",
  ],
};
