import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const contactId = request.nextUrl.searchParams.get("contactId");

    const where = contactId ? { crmContactId: contactId } : {};

    const emails = await prisma.email.findMany({
      where,
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(emails);
  } catch (error) {
    console.error("Failed to fetch emails:", error);
    return Response.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}
