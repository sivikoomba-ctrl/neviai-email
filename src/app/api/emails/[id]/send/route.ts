import { prisma } from "@/lib/prisma";
import { logInteraction } from "@/lib/api/crm-app";
import { Resend } from "resend";
import { NextRequest } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const email = await prisma.email.findUnique({ where: { id } });

    if (!email) {
      return Response.json({ error: "Email not found" }, { status: 404 });
    }

    if (email.status === "sent") {
      return Response.json({ error: "Email already sent" }, { status: 400 });
    }

    // Plain HTML that looks personal
    const bodyLines = email.body.split("\n");
    const htmlBody = bodyLines
      .map((line) => (line.trim() === "" ? "<br>" : line))
      .join("<br>");

    // Send via Resend — Resend handles open tracking automatically
    // Store our email ID in headers so webhook can match it back
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "NeviAI <onboarding@resend.dev>",
      replyTo: process.env.RESEND_REPLY_TO || undefined,
      to: [email.contactEmail],
      subject: email.subject,
      text: email.body,
      html: htmlBody,
      headers: {
        "X-Email-Id": id,
      },
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return Response.json(
        { error: `Failed to send email: ${resendError.message}` },
        { status: 500 }
      );
    }

    const updated = await prisma.email.update({
      where: { id },
      data: {
        status: "sent",
        sentAt: new Date(),
        // Store Resend's email ID for webhook matching
        templateId: resendData?.id || null,
      },
    });

    // Log interaction to CRM (fire-and-forget)
    if (email.crmContactId && email.crmContactId !== "manual") {
      logInteraction(email.crmContactId, {
        type: "email_sent",
        subject: email.subject,
        body: email.body,
        metadata: JSON.stringify({ emailId: email.id, campaignId: email.campaignId }),
      }).catch(() => {});
    }

    return Response.json(updated);
  } catch (error) {
    console.error("Failed to send email:", error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
