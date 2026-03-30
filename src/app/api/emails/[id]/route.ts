import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const email = await prisma.email.findUnique({
      where: { id },
      include: { campaign: true },
    });

    if (!email) {
      return Response.json({ error: "Email not found" }, { status: 404 });
    }

    return Response.json(email);
  } catch (error) {
    console.error("Failed to fetch email:", error);
    return Response.json({ error: "Failed to fetch email" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.email.delete({ where: { id } });

    return Response.json({ message: "Email deleted" });
  } catch (error) {
    console.error("Failed to delete email:", error);
    return Response.json(
      { error: "Failed to delete email" },
      { status: 500 }
    );
  }
}
