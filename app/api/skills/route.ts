import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

type PrismaWithSkill = {
  skill: {
    findMany: (args: object) => Promise<unknown[]>;
    create: (args: object) => Promise<unknown>;
    update: (args: object) => Promise<unknown>;
    delete: (args: object) => Promise<unknown>;
  };
};

export async function GET() {
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const skills = await (prisma as unknown as PrismaWithSkill).skill.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });
    return NextResponse.json({ success: true, data: skills });
  } catch (error) {
    console.error("Failed to fetch skills:", error);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { name, category, proficiency, projectUsage, order } = body;

    if (!name || !category || !proficiency) {
      return NextResponse.json({ error: "name, category, and proficiency are required" }, { status: 400 });
    }

    const skill = await (prisma as unknown as PrismaWithSkill).skill.create({
      data: {
        name,
        category,
        proficiency,
        projectUsage: projectUsage ?? "",
        order: order ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error("Failed to create skill:", error);
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const skill = await (prisma as unknown as PrismaWithSkill).skill.update({
      where: { id },
      data: body,
    });
    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error("Failed to update skill:", error);
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  try {
    await (prisma as unknown as PrismaWithSkill).skill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete skill:", error);
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}
