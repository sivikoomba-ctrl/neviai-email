import { prisma } from "@/lib/prisma";
import { logInteraction } from "@/lib/api/crm-app";
import { NextRequest } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { emails: true },
    });

    if (!campaign) {
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }

    const draftEmails = campaign.emails.filter((e) => e.status === "draft");

    if (draftEmails.length === 0) {
      return Response.json({ error: "No draft emails to send" }, { status: 400 });
    }

    const now = new Date();

    await prisma.email.updateMany({
      where: { campaignId: id, status: "draft" },
      data: { status: "sent", sentAt: now },
    });

    await prisma.campaign.update({
      where: { id },
      data: { status: "sent" },
    });

    // Log interactions to CRM for each email (fire-and-forget)
    for (const email of draftEmails) {
      if (email.crmContactId && email.crmContactId !== "manual") {
        logInteraction(email.crmContactId, {
          type: "email_sent",
          subject: email.subject,
          body: email.body,
          metadata: JSON.stringify({ emailId: email.id, campaignId: id }),
        }).catch(() => {});
      }
    }

    return Response.json({
      message: `${draftEmails.length} emails sent`,
      sentCount: draftEmails.length,
    });
  } catch (error) {
    console.error("Failed to send campaign:", error);
    return Response.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}
