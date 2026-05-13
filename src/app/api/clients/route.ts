import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allClients = await db.query.clients.findMany({
      orderBy: [desc(clients.createdAt)],
    });

    return NextResponse.json({ success: true, data: allClients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newClient = await db
      .insert(clients)
      .values({
        name: body.name,
        contactPerson: body.contactPerson,
        email: body.email,
        phone: body.phone,
        company: body.company,
        website: body.website,
        address: body.address,
        country: body.country,
      })
      .returning();

    return NextResponse.json({ success: true, data: newClient[0] });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create client" },
      { status: 500 }
    );
  }
}
