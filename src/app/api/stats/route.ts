import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Get total projects count
    const totalProjectsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects);
    const totalProjects = Number(totalProjectsResult[0]?.count || 0);

    // Get projects by phase
    const byPhaseResult = await db
      .select({
        phase: projects.projectPhase,
        count: sql<number>`count(*)`,
      })
      .from(projects)
      .groupBy(projects.projectPhase);

    // Get projects by status
    const byStatusResult = await db
      .select({
        status: projects.status,
        count: sql<number>`count(*)`,
      })
      .from(projects)
      .groupBy(projects.status);

    // Get projects by priority
    const byPriorityResult = await db
      .select({
        priority: projects.priority,
        count: sql<number>`count(*)`,
      })
      .from(projects)
      .groupBy(projects.priority);

    // Get average completion
    const avgCompletionResult = await db
      .select({
        avg: sql<number>`AVG(CAST(${projects.percentageCompletion} AS NUMERIC))`,
      })
      .from(projects);
    const avgCompletion = Number(avgCompletionResult[0]?.avg || 0);

    // Get completed projects
    const completedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(sql`${projects.percentageCompletion} = 100`);
    const completedProjects = Number(completedResult[0]?.count || 0);

    // Get at-risk projects (completion < 50% and status active)
    const atRiskResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(
        sql`${projects.percentageCompletion} < 50 AND ${projects.status} = 'active'`
      );
    const atRiskProjects = Number(atRiskResult[0]?.count || 0);

    return NextResponse.json({
      success: true,
      data: {
        totalProjects,
        byPhase: byPhaseResult,
        byStatus: byStatusResult,
        byPriority: byPriorityResult,
        avgCompletion: Math.round(avgCompletion),
        completedProjects,
        atRiskProjects,
        activeProjects: totalProjects - completedProjects,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
