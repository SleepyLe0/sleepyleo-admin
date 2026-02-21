import { NextResponse } from "next/server";
import {
  validateCredentials,
  generateSessionToken,
  setAuthCookie,
  clearAuthCookie,
  isAuthenticated,
} from "@/lib/auth";

// In-memory rate limiter: ip → { count, firstAttempt }
const failedAttempts = new Map<string, { count: number; firstAttempt: number }>();
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES = 10;

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): { limited: boolean; retryAfterSeconds: number } {
  const entry = failedAttempts.get(ip);
  if (!entry) return { limited: false, retryAfterSeconds: 0 };

  const elapsed = Date.now() - entry.firstAttempt;
  if (elapsed > RATE_WINDOW_MS) {
    failedAttempts.delete(ip);
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (entry.count >= MAX_FAILURES) {
    const retryAfterSeconds = Math.ceil((RATE_WINDOW_MS - elapsed) / 1000);
    return { limited: true, retryAfterSeconds };
  }

  return { limited: false, retryAfterSeconds: 0 };
}

function recordFailure(ip: string) {
  const entry = failedAttempts.get(ip);
  if (!entry) {
    failedAttempts.set(ip, { count: 1, firstAttempt: Date.now() });
  } else {
    failedAttempts.set(ip, { ...entry, count: entry.count + 1 });
  }
}

function clearFailures(ip: string) {
  failedAttempts.delete(ip);
}

// POST - Login
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { limited, retryAfterSeconds } = isRateLimited(ip);

  if (limited) {
    return NextResponse.json(
      { error: "Too many failed attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (!validateCredentials(username, password)) {
      recordFailure(ip);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    clearFailures(ip);
    const token = generateSessionToken();
    await setAuthCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}

// DELETE - Logout
export async function DELETE() {
  try {
    await clearAuthCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}

// GET - Check auth status
export async function GET() {
  const authenticated = await isAuthenticated();
  return NextResponse.json({ authenticated });
}
