import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalEmails, totalSent, totalOpened, totalBounced, totalDrafts, totalCampaigns] =
      await Promise.all([
        prisma.email.count(),
        prisma.email.count({ where: { status: "sent" } }),
        prisma.email.count({ where: { opened: true } }),
        prisma.email.count({ where: { status: "bounced" } }),
        prisma.email.count({ where: { status: "draft" } }),
        prisma.campaign.count(),
      ]);

    // Emails sent per day for the last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentEmails = await prisma.email.findMany({
      where: {
        sentAt: { gte: fourteenDaysAgo },
      },
      select: { sentAt: true, opened: true, openedAt: true },
    });

    const dailyCounts: Record<string, { sent: number; opened: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      dailyCounts[key] = { sent: 0, opened: 0 };
    }

    for (const email of recentEmails) {
      if (email.sentAt) {
        const key = email.sentAt.toISOString().split("T")[0];
        if (key in dailyCounts) {
          dailyCounts[key].sent++;
          if (email.opened) dailyCounts[key].opened++;
        }
      }
    }

    const dailyStats = Object.entries(dailyCounts).map(([date, counts]) => ({
      date,
      sent: counts.sent,
      opened: counts.opened,
    }));

    // Recent email activity (last 20 emails with status)
    const recentActivity = await prisma.email.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        contactName: true,
        contactEmail: true,
        subject: true,
        status: true,
        opened: true,
        sentAt: true,
        openedAt: true,
        createdAt: true,
        tone: true,
        campaign: { select: { name: true } },
      },
    });

    // Top recipients (most emails sent to)
    const allSentEmails = await prisma.email.findMany({
      where: { status: "sent" },
      select: { contactName: true, contactEmail: true, opened: true },
    });

    const recipientMap: Record<string, { name: string; email: string; sent: number; opened: number }> = {};
    for (const e of allSentEmails) {
      if (!recipientMap[e.contactEmail]) {
        recipientMap[e.contactEmail] = { name: e.contactName, email: e.contactEmail, sent: 0, opened: 0 };
      }
      recipientMap[e.contactEmail].sent++;
      if (e.opened) recipientMap[e.contactEmail].opened++;
    }
    const topRecipients = Object.values(recipientMap)
      .sort((a, b) => b.sent - a.sent)
      .slice(0, 5);

    // Campaign performance
    const campaigns = await prisma.campaign.findMany({
      include: {
        emails: { select: { status: true, opened: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const campaignStats = campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      totalEmails: c.emails.length,
      sent: c.emails.filter((e) => e.status === "sent").length,
      opened: c.emails.filter((e) => e.opened).length,
      openRate: c.emails.filter((e) => e.status === "sent").length > 0
        ? Math.round((c.emails.filter((e) => e.opened).length / c.emails.filter((e) => e.status === "sent").length) * 100)
        : 0,
    }));

    return Response.json({
      totalEmails,
      totalSent,
      totalOpened,
      totalBounced,
      totalDrafts,
      totalCampaigns,
      openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
      bounceRate: totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0,
      dailyStats,
      recentActivity,
      topRecipients,
      campaignStats,
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return Response.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
