import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all projects (for admin)
export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST create or sync project from GitHub
export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { githubId, name, slug, description, repoUrl, liveUrl, stars, forks, language, techStack } = body;

    if (githubId) {
      const existing = await prisma.project.findUnique({
        where: { githubId },
      });

      if (existing) {
        const updated = await prisma.project.update({
          where: { githubId },
          data: {
            name,
            description,
            repoUrl,
            liveUrl,
            stars,
            forks,
            language,
            techStack,
          },
        });
        return NextResponse.json({ project: updated, action: "updated" });
      }
    }

    const slugExists = await prisma.project.findUnique({
      where: { slug },
    });

    const finalSlug = slugExists ? `${slug}-${Date.now()}` : slug;

    const project = await prisma.project.create({
      data: {
        githubId,
        name,
        slug: finalSlug,
        description,
        repoUrl,
        liveUrl,
        stars: stars || 0,
        forks: forks || 0,
        language,
        techStack: techStack || [],
        visible: true,
      },
    });

    return NextResponse.json({ project, action: "created" }, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

// PATCH update project
export async function PATCH(request: Request) {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.update({
      where: { id },
      data,
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE project
export async function DELETE(request: Request) {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
