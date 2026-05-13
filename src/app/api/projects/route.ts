import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, clients, teamMembers } from "@/db/schema";
import { eq, like, or, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const phase = searchParams.get("phase") || "";
    const status = searchParams.get("status") || "";
    const platform = searchParams.get("platform") || "";

    let whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(projects.projectName, `%${search}%`),
          like(projects.projectNo, `%${search}%`)
        )
      );
    }

    if (phase) {
      whereConditions.push(eq(projects.projectPhase, phase));
    }

    if (status) {
      whereConditions.push(eq(projects.status, status));
    }

    const allProjects = await db.query.projects.findMany({
      with: {
        // We'll handle client data separately if needed
      },
      orderBy: [desc(projects.createdAt)],
    });

    // Filter client-side for platform (jsonb filtering in drizzle is complex)
    let filteredProjects = allProjects;
    if (platform) {
      filteredProjects = allProjects.filter((project) => {
        const platforms = (project.platforms as string[]) || [];
        return platforms.some((platformItem) => platformItem.toLowerCase().includes(platform.toLowerCase()));
      });
    }

    // Apply other filters
    if (whereConditions.length > 0 && !platform) {
      filteredProjects = await db
        .select()
        .from(projects)
        .where(whereConditions.reduce((acc, condition) => acc && condition))
        .orderBy(desc(projects.createdAt));
    }

    return NextResponse.json({ success: true, data: filteredProjects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newProject = await db
      .insert(projects)
      .values({
        projectNo: body.projectNo,
        projectName: body.projectName,
        platforms: body.platforms || [],
        primaryResources: body.primaryResources || [],
        projectPhase: body.projectPhase || "Planning",
        projectTracker: body.projectTracker || "",
        plannedClosureDate: body.plannedClosureDate || null,
        salesMilestones: body.salesMilestones || [],
        operationalMilestones: body.operationalMilestones || [],
        percentageCompletion: body.percentageCompletion || "0",
        lastWeekProgress: body.lastWeekProgress || "",
        thisWeekTarget: body.thisWeekTarget || "",
        projectRisks: body.projectRisks || "",
        salesCoordinator: body.salesCoordinator || "",
        clientId: body.clientId || null,
        status: body.status || "active",
        priority: body.priority || "medium",
      })
      .returning();

    return NextResponse.json({ success: true, data: newProject[0] });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}
