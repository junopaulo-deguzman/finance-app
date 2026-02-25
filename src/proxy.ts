import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/auth/jwt";

const PUBLIC_PATHS = new Set(["/sign-in", "/api/sign-in"]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }

  return pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.startsWith("/robots.txt");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  const isValid = await verifyAuthToken(token)
    .then(() => true)
    .catch(() => false);

  if (isValid) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("error", "1");
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
