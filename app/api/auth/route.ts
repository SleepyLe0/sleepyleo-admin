import { NextResponse } from "next/server";
import {
  validateCredentials,
  generateSessionToken,
  setAuthCookie,
  clearAuthCookie,
  isAuthenticated,
} from "@/lib/auth";

// POST - Login
export async function POST(request: Request) {
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
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

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
