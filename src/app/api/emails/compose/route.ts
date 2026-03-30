import { prisma } from "@/lib/prisma";
import { composeEmail } from "@/lib/ai/compose-email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, tone, contactId, contactName, contactEmail } = body;

    if (!prompt || !contactName || !contactEmail) {
      return Response.json(
        { error: "prompt, contactName, and contactEmail are required" },
        { status: 400 }
      );
    }

    const toneLabel = tone || "professional";
    let subject: string;
    let emailBody: string;

    try {
      const result = await composeEmail({
        prompt,
        tone: toneLabel,
        contactName,
        contactEmail,
      });
      subject = result.subject;
      emailBody = result.body;
    } catch {
      // Fallback mock if AI unavailable
      const toneStyles: Record<string, { greeting: string; closing: string; style: string }> = {
        professional: { greeting: `Dear ${contactName},`, closing: "Best regards", style: "I am writing to" },
        friendly: { greeting: `Hi ${contactName}!`, closing: "Cheers", style: "I wanted to reach out and" },
        formal: { greeting: `Dear ${contactName},`, closing: "Sincerely", style: "I am formally writing to" },
        casual: { greeting: `Hey ${contactName},`, closing: "Talk soon", style: "Just wanted to" },
      };
      const ts = toneStyles[toneLabel] || toneStyles.professional;
      subject = `Re: ${prompt.slice(0, 60)}${prompt.length > 60 ? "..." : ""}`;
      emailBody = `${ts.greeting}\n\n${ts.style} ${prompt.toLowerCase()}.\n\nWe believe this is an excellent opportunity to collaborate and create meaningful outcomes together. I would love to schedule a time to discuss this further at your convenience.\n\nPlease feel free to reach out if you have any questions or need additional information.\n\n${ts.closing},\nAI Email Assistant`;
    }

    const email = await prisma.email.create({
      data: {
        crmContactId: contactId || "manual",
        contactName,
        contactEmail,
        subject,
        body: emailBody,
        tone: toneLabel,
        status: "draft",
      },
    });

    return Response.json(email, { status: 201 });
  } catch (error) {
    console.error("Failed to compose email:", error);
    return Response.json({ error: "Failed to compose email" }, { status: 500 });
  }
}
