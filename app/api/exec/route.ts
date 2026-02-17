import { NextResponse } from "next/server";
import { executeCommand } from "@/lib/actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { command } = body;

    if (!command || typeof command !== "string") {
      return NextResponse.json(
        { success: false, error: "Command is required" },
        { status: 400 }
      );
    }

    if (command.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Command too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    const result = await executeCommand(command);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Exec API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute command" },
      { status: 500 }
    );
  }
}
