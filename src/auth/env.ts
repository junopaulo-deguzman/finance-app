const defaultHouseId = process.env.HOUSE_ID?.trim();

export function getHouseIdFromEnv() {
  if (!defaultHouseId) {
    throw new Error("HOUSE_ID is required.");
  }

  return defaultHouseId;
}

export function getJwtSecretFromEnv() {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error("JWT_SECRET is required.");
  }

  return secret;
}

export function getJwtIssuerFromEnv() {
  const issuer = process.env.JWT_ISSUER?.trim();
  return issuer || "finance-app";
}

export function getJwtAudienceFromEnv() {
  const audience = process.env.JWT_AUDIENCE?.trim();
  return audience || "finance-app-users";
}

export function getSignInUsernameFromEnv() {
  const username = process.env.AUTH_USERNAME?.trim();

  if (!username) {
    throw new Error("AUTH_USERNAME is required.");
  }

  return username;
}

export function getSignInPasswordFromEnv() {
  const password = process.env.AUTH_PASSWORD?.trim();

  if (!password) {
    throw new Error("AUTH_PASSWORD is required.");
  }

  return password;
}

export function getSessionTtlHoursFromEnv() {
  const raw = process.env.AUTH_SESSION_TTL_HOURS?.trim();
  const parsed = Number(raw ?? "24");

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 24;
  }

  return parsed;
}
