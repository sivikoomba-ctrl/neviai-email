import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        emails: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(campaigns);
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return Response.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, templateId } = body;

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description: description || null,
        templateId: templateId || null,
      },
    });

    return Response.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return Response.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
