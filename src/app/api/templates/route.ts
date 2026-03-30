import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: "desc" },
    });

    return Response.json(templates);
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return Response.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, subject, body: templateBody, category, variables } = body;

    if (!name || !subject || !templateBody) {
      return Response.json(
        { error: "name, subject, and body are required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        subject,
        body: templateBody,
        category: category || null,
        variables: variables || null,
      },
    });

    return Response.json(template, { status: 201 });
  } catch (error) {
    console.error("Failed to create template:", error);
    return Response.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
