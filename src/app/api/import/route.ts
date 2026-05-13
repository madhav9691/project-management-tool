import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, tasks, clients, teamMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

function parseList(field: any): string[] {
  if (Array.isArray(field)) return field;
  if (typeof field !== "string") return [];

  // Try JSON.parse first (handles quoted JSON arrays or strings)
  try {
    const parsed = JSON.parse(field);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "string") return [parsed];
  } catch (e) {
    // Fall back to delimiter-based parsing below
  }

  // Remove trailing ellipses and trim
  const cleaned = field.replace(/\.{2,}$/g, "").trim();

  // Split on common delimiters: semicolon, comma, pipe, slash, ampersand, or the word 'and'
  const parts = cleaned
    .split(/\s*(?:;|,|\||\/|&|\band\b)\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let inserted = 0;
    const errors: string[] = [];

    switch (type) {
      case "projects":
        for (const item of data) {
          try {
            const existing = await db
              .select()
              .from(projects)
              .where(eq(projects.projectNo, item.projectNo));

            if (existing.length === 0) {
              await db.insert(projects).values({
                projectNo: item.projectNo,
                projectName: item.projectName,
                platforms: parseList(item.platforms),
                primaryResources: parseList(item.primaryResources),
                projectPhase: item.projectPhase || "Planning",
                projectTracker: item.projectTracker || "",
                plannedClosureDate: item.plannedClosureDate || null,
                salesMilestones: parseList(item.salesMilestones),
                operationalMilestones: parseList(item.operationalMilestones),
                percentageCompletion: item.percentageCompletion || "0",
                lastWeekProgress: item.lastWeekProgress || "",
                thisWeekTarget: item.thisWeekTarget || "",
                projectRisks: item.projectRisks || "",
                salesCoordinator: item.salesCoordinator || "",
                status: item.status || "active",
                priority: item.priority || "medium",
              });
              inserted++;
            }
          } catch (err: any) {
            errors.push(`Project ${item.projectNo}: ${err.message}`);
          }
        }
        break;

      case "tasks":
        for (const item of data) {
          try {
            await db.insert(tasks).values({
              projectId: item.projectId,
              title: item.title,
              description: item.description || "",
              assignedTo: item.assignedTo || null,
              status: item.status || "todo",
              priority: item.priority || "medium",
              estimatedHours: item.estimatedHours || null,
              startDate: item.startDate || null,
              dueDate: item.dueDate || null,
              relatedMilestone: item.relatedMilestone || "",
              progress: item.progress || "0",
              notes: item.notes || "",
              tags: parseList(item.tags),
            });
            inserted++;
          } catch (err: any) {
            errors.push(`Task ${item.title}: ${err.message}`);
          }
        }
        break;

      case "clients":
        for (const item of data) {
          try {
            await db.insert(clients).values({
              name: item.name,
              contactPerson: item.contactPerson || "",
              email: item.email || "",
              phone: item.phone || "",
              company: item.company || "",
              website: item.website || "",
              country: item.country || "",
            });
            inserted++;
          } catch (err: any) {
            errors.push(`Client ${item.name}: ${err.message}`);
          }
        }
        break;

      case "team":
        for (const item of data) {
          try {
            await db.insert(teamMembers).values({
              name: item.name,
              role: item.role || "",
              email: item.email || "",
              skills: parseList(item.skills),
              isAvailable: item.isAvailable || "available",
            });
            inserted++;
          } catch (err: any) {
            errors.push(`Member ${item.name}: ${err.message}`);
          }
        }
        break;
    }

    return NextResponse.json({
      success: true,
      inserted,
      errors,
      message: `Successfully imported ${inserted} ${type}${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to import data" },
      { status: 500 }
    );
  }
}
