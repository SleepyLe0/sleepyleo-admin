import { NextResponse } from "next/server";
import { getSystemHealth } from "@/lib/actions";

export async function GET() {
  try {
    const health = await getSystemHealth();
    return NextResponse.json(health);
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { error: "Failed to get system health" },
      { status: 500 }
    );
  }
}
