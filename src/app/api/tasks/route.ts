import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, teamMembers } from "@/db/schema";
import { eq, and, like, or, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("projectId");
    const assignedTo = searchParams.get("assignedTo");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    let allTasks = await db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt));

    if (projectId) {
      allTasks = allTasks.filter((t) => t.projectId === parseInt(projectId));
    }
    if (assignedTo) {
      allTasks = allTasks.filter((t) => t.assignedTo === parseInt(assignedTo));
    }
    if (status) {
      allTasks = allTasks.filter((t) => t.status === status);
    }
    if (priority) {
      allTasks = allTasks.filter((t) => t.priority === priority);
    }

    return NextResponse.json({ success: true, data: allTasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newTask = await db
      .insert(tasks)
      .values({
        projectId: body.projectId,
        title: body.title,
        description: body.description || "",
        assignedTo: body.assignedTo || null,
        createdBy: body.createdBy || null,
        status: body.status || "todo",
        priority: body.priority || "medium",
        estimatedHours: body.estimatedHours || null,
        actualHours: body.actualHours || null,
        startDate: body.startDate || null,
        dueDate: body.dueDate || null,
        completedDate: body.completedDate || null,
        tags: body.tags || [],
        relatedMilestone: body.relatedMilestone || "",
        progress: body.progress || "0",
        notes: body.notes || "",
      })
      .returning();

    return NextResponse.json({ success: true, data: newTask[0] });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
}
