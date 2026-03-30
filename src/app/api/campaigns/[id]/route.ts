import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { emails: { orderBy: { createdAt: "desc" } } },
    });

    if (!campaign) {
      return Response.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return Response.json(campaign);
  } catch (error) {
    console.error("Failed to fetch campaign:", error);
    return Response.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, status, templateId } = body;

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(templateId !== undefined && { templateId }),
      },
    });

    return Response.json(campaign);
  } catch (error) {
    console.error("Failed to update campaign:", error);
    return Response.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.campaign.delete({ where: { id } });

    return Response.json({ message: "Campaign deleted" });
  } catch (error) {
    console.error("Failed to delete campaign:", error);
    return Response.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
