import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const template = await prisma.template.findUnique({ where: { id } });

    if (!template) {
      return Response.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return Response.json(template);
  } catch (error) {
    console.error("Failed to fetch template:", error);
    return Response.json(
      { error: "Failed to fetch template" },
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
    const { name, subject, body: templateBody, category, variables } = body;

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(subject !== undefined && { subject }),
        ...(templateBody !== undefined && { body: templateBody }),
        ...(category !== undefined && { category }),
        ...(variables !== undefined && { variables }),
      },
    });

    return Response.json(template);
  } catch (error) {
    console.error("Failed to update template:", error);
    return Response.json(
      { error: "Failed to update template" },
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

    await prisma.template.delete({ where: { id } });

    return Response.json({ message: "Template deleted" });
  } catch (error) {
    console.error("Failed to delete template:", error);
    return Response.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
