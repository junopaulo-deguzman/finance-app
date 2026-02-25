import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionTtlHoursFromEnv, getSignInPasswordFromEnv, getSignInUsernameFromEnv } from "@/auth/env";
import { AUTH_COOKIE_NAME, signAuthToken } from "@/auth/jwt";

type SignInRequestBody = {
  username?: unknown;
  password?: unknown;
};

function unauthorized(request: Request, wantsJson: boolean) {
  if (wantsJson) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const redirectUrl = new URL("/sign-in", request.url);
  redirectUrl.searchParams.set("error", "1");
  return NextResponse.redirect(redirectUrl);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const wantsJson = contentType.includes("application/json");
  let username = "";
  let password = "";

  if (wantsJson) {
    const body = (await request.json().catch(() => null)) as SignInRequestBody | null;
    username = String(body?.username ?? "").trim();
    password = String(body?.password ?? "").trim();
  } else {
    const formData = await request.formData().catch(() => null);
    username = String(formData?.get("username") ?? "").trim();
    password = String(formData?.get("password") ?? "").trim();
  }

  if (username !== getSignInUsernameFromEnv() || password !== getSignInPasswordFromEnv()) {
    return unauthorized(request, wantsJson);
  }

  const token = await signAuthToken(username);
  const maxAge = getSessionTtlHoursFromEnv() * 60 * 60;

  (await cookies()).set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  if (wantsJson) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.redirect(new URL("/", request.url));
}
