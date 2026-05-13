import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allMembers = await db.query.teamMembers.findMany({
      orderBy: [desc(teamMembers.createdAt)],
    });

    return NextResponse.json({ success: true, data: allMembers });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newMember = await db
      .insert(teamMembers)
      .values({
        name: body.name,
        role: body.role,
        skills: body.skills || [],
        email: body.email,
        isAvailable: body.isAvailable || "available",
      })
      .returning();

    return NextResponse.json({ success: true, data: newMember[0] });
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create team member" },
      { status: 500 }
    );
  }
}
