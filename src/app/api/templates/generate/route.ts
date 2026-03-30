import { prisma } from "@/lib/prisma";
import { generateTemplate } from "@/lib/ai/generate-template";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, category } = body;

    if (!description) {
      return Response.json({ error: "description is required" }, { status: 400 });
    }

    let name: string;
    let subject: string;
    let templateBody: string;
    let variables: string;

    try {
      const result = await generateTemplate({
        category: category || "general",
        description,
      });
      name = result.name;
      subject = result.subject;
      templateBody = result.body;
      variables = result.variables.join(", ");
    } catch {
      // Fallback if AI unavailable
      name = `${category || "Custom"} Template`;
      subject = `{{name}} - ${description.slice(0, 40)}`;
      templateBody = `Dear {{name}},\n\n${description}\n\nWe look forward to working with you!\n\nBest regards,\nThe {{company}} Team`;
      variables = "{{name}}, {{company}}";
    }

    const template = await prisma.template.create({
      data: {
        name,
        subject,
        body: templateBody,
        category: category || "general",
        variables,
        isAiGenerated: true,
      },
    });

    return Response.json(template, { status: 201 });
  } catch (error) {
    console.error("Failed to generate template:", error);
    return Response.json({ error: "Failed to generate template" }, { status: 500 });
  }
}
