import { prisma } from "@/lib/prisma";
import { logInteraction } from "@/lib/api/crm-app";

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    headers?: { name: string; value: string }[];
  };
}

// Find our email by Resend's email_id (stored in templateId field)
async function findEmailByResendId(resendEmailId: string) {
  return prisma.email.findFirst({
    where: { templateId: resendEmailId },
  });
}

// Fallback: find by recipient email
async function findEmailByRecipient(recipientEmail: string) {
  return prisma.email.findFirst({
    where: {
      contactEmail: recipientEmail,
      status: "sent",
    },
    orderBy: { sentAt: "desc" },
  });
}

export async function POST(request: Request) {
  try {
    const event: ResendWebhookEvent = await request.json();

    console.log("Resend webhook:", event.type, JSON.stringify(event.data));

    const resendEmailId = event.data.email_id;
    const recipientEmail = event.data.to?.[0];

    // Try to find our email record
    let email = resendEmailId ? await findEmailByResendId(resendEmailId) : null;
    if (!email && recipientEmail) {
      email = await findEmailByRecipient(recipientEmail);
    }

    switch (event.type) {
      case "email.opened": {
        if (email && !email.opened) {
          await prisma.email.update({
            where: { id: email.id },
            data: { opened: true, openedAt: new Date() },
          });
          console.log(`Email ${email.id} opened by ${email.contactEmail}`);
        }
        break;
      }

      case "email.clicked": {
        // Also counts as opened
        if (email && !email.opened) {
          await prisma.email.update({
            where: { id: email.id },
            data: { opened: true, openedAt: new Date() },
          });
          console.log(`Email ${email.id} clicked by ${email.contactEmail}`);
        }
        break;
      }

      case "email.bounced": {
        if (email) {
          await prisma.email.update({
            where: { id: email.id },
            data: { status: "bounced" },
          });
          console.log(`Email ${email.id} bounced`);
        }
        break;
      }

      case "email.complained": {
        console.log(`Spam complaint from ${recipientEmail}`);
        break;
      }

      case "email.delivered": {
        console.log(`Email delivered to ${recipientEmail}`);
        break;
      }

      default:
        console.log(`Unhandled webhook: ${event.type}`);
    }

    // Log reply-related events to CRM
    if (event.type === "email.replied" && email && email.crmContactId && email.crmContactId !== "manual") {
      await logInteraction(email.crmContactId, {
        type: "email_replied",
        subject: `Re: ${email.subject}`,
        body: `${email.contactEmail} replied to "${email.subject}"`,
        metadata: JSON.stringify({ emailId: email.id, repliedAt: event.created_at }),
      });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
