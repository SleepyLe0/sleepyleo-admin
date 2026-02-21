import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

type PrismaWithProfile = {
  profile: {
    findFirst: () => Promise<{ id: string } | null>;
    create: (args: object) => Promise<unknown>;
    update: (args: object) => Promise<unknown>;
  };
};

export async function GET() {
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const profile = await (prisma as unknown as PrismaWithProfile).profile.findFirst();
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const {
      name, bio, background, education, location, focus, fuel,
      timeline, availableForHire, availableLabel,
      email, github, linkedin, ctaCopy,
    } = body;

    const existing = await (prisma as unknown as PrismaWithProfile).profile.findFirst();

    const data = {
      name: name ?? "",
      bio: bio ?? "",
      background: background ?? "",
      education: education ?? "",
      location: location ?? "",
      focus: focus ?? "",
      fuel: fuel ?? "",
      timeline: timeline ?? [],
      availableForHire: availableForHire ?? true,
      availableLabel: availableLabel ?? "Open to opportunities",
      email: email ?? "",
      github: github ?? "SleepyLe0",
      linkedin: linkedin ?? "kundids-khawmeesri-90814526a",
      ctaCopy: ctaCopy ?? "Let's build something.",
    };

    let profile;
    if (existing) {
      profile = await (prisma as unknown as PrismaWithProfile).profile.update({
        where: { id: existing.id },
        data,
      });
    } else {
      profile = await (prisma as unknown as PrismaWithProfile).profile.create({
        data,
      });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
