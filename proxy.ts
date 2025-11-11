import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { checkIsPublicRoute, apiLinks, Routes } from "./lib/routes";

// API routes that should be accessible without authentication
const accessibleApiRoutes: any[] = [];

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Single session fetch
  const session = getSessionCookie(req);

  const isApiAuthRoute = pathname.startsWith(apiLinks.authPrefix);
  const isAccessibleApiRoute = accessibleApiRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAccessibleRoute = checkIsPublicRoute(pathname);

  // Approve public api routes
  if (isApiAuthRoute || isAccessibleApiRoute || pathname === "/")
    return NextResponse.next();

  if (!session && !isAccessibleRoute) {
    const searchParams = url.searchParams.toString();
    let callbackUrl = pathname;
    if (searchParams.length > 0) {
      callbackUrl += `?${searchParams}`;
    }
    const encodeCallbackUrl = encodeURIComponent(callbackUrl);

    return NextResponse.redirect(
      new URL(`${Routes.auth.signIn}?callbackUrl=${encodeCallbackUrl}`, url)
    );
  }

  // If we are already signed in.
  // if (session && pathname === Routes.auth.signIn) {
  //   return NextResponse.redirect(new URL(Routes.home, url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)", "/"],
};
