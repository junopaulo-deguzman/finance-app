import { jwtVerify, SignJWT, type JWTPayload } from "jose";

import {
  getHouseIdFromEnv,
  getJwtAudienceFromEnv,
  getJwtIssuerFromEnv,
  getJwtSecretFromEnv,
  getSessionTtlHoursFromEnv,
} from "@/auth/env";

export const AUTH_COOKIE_NAME = "finance_auth_token";

export type AppJwtPayload = JWTPayload & {
  houseId: string;
  username: string;
};

function getJwtSecretKey() {
  return new TextEncoder().encode(getJwtSecretFromEnv());
}

export async function signAuthToken(username: string) {
  const now = Math.floor(Date.now() / 1000);
  const ttlHours = getSessionTtlHoursFromEnv();

  return new SignJWT({ houseId: getHouseIdFromEnv(), username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(getJwtIssuerFromEnv())
    .setAudience(getJwtAudienceFromEnv())
    .setIssuedAt(now)
    .setExpirationTime(now + ttlHours * 60 * 60)
    .sign(getJwtSecretKey());
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecretKey(), {
    issuer: getJwtIssuerFromEnv(),
    audience: getJwtAudienceFromEnv(),
  });

  if (!payload.houseId || payload.houseId !== getHouseIdFromEnv()) {
    throw new Error("Invalid house scope.");
  }

  return payload as AppJwtPayload;
}

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization")?.trim();

  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return header.slice(7).trim();
}

export function readTokenFromRequest(request: Request) {
  const bearerToken = getBearerToken(request);

  if (bearerToken) {
    return bearerToken;
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function verifyJwtFromRequest(request: Request) {
  const token = readTokenFromRequest(request);

  if (!token) {
    throw new Error("Missing auth token.");
  }

  return verifyAuthToken(token);
}
