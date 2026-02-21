import { cookies } from "next/headers";
import crypto from "crypto";

const AUTH_COOKIE_NAME = "sleepyleo_auth";
const AUTH_SECRET = process.env.AUTH_SECRET || "default-secret-change-me";

// Startup validation — warn loudly if the secret is missing or default in production
if (process.env.NODE_ENV === "production") {
  if (!process.env.AUTH_SECRET) {
    console.error("[auth] FATAL: AUTH_SECRET environment variable is not set in production!");
  } else if (process.env.AUTH_SECRET === "default-secret-change-me") {
    console.error("[auth] FATAL: AUTH_SECRET is still set to the default value in production!");
  }
}

export function generateSessionToken(): string {
  const timestamp = Date.now().toString(16);
  const random = crypto.randomBytes(32).toString("hex");
  const payload = `${timestamp}.${random}`;
  const hmac = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("hex");
  return `${payload}.${hmac}`;
}

export function verifySessionToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [timestamp, random, providedHmac] = parts;
  const payload = `${timestamp}.${random}`;
  const expectedHmac = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payload)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(providedHmac, "hex"),
      Buffer.from(expectedHmac, "hex")
    );
  } catch {
    return false;
  }
}

export function validateCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.error("Admin credentials not configured");
    return false;
  }

  return username === adminUsername && password === adminPassword;
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthCookie();
  if (!token) return false;
  return verifySessionToken(token);
}
