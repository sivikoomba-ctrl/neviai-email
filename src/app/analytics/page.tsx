"use client";

import { useEffect, useState } from "react";

interface DailyStat {
  date: string;
  sent: number;
  opened: number;
}

interface RecentEmail {
  id: string;
  contactName: string;
  contactEmail: string;
  subject: string;
  status: string;
  opened: boolean;
  sentAt: string | null;
  openedAt: string | null;
  createdAt: string;
  tone: string | null;
  campaign: { name: string } | null;
}

interface TopRecipient {
  name: string;
  email: string;
  sent: number;
  opened: number;
}

interface CampaignStat {
  id: string;
  name: string;
  status: string;
  totalEmails: number;
  sent: number;
  opened: number;
  openRate: number;
}

interface Analytics {
  totalEmails: number;
  totalSent: number;
  totalOpened: number;
  totalBounced: number;
  totalDrafts: number;
  totalCampaigns: number;
  openRate: number;
  bounceRate: number;
  dailyStats: DailyStat[];
  recentActivity: RecentEmail[];
  topRecipients: TopRecipient[];
  campaignStats: CampaignStat[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Failed to load analytics</p>
      </div>
    );
  }

  const maxSent = Math.max(...analytics.dailyStats.map((d) => d.sent), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Email Analytics</h1>
        <p className="text-slate-400 mt-1">Track performance, opens, and engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Total Emails", value: analytics.totalEmails, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Sent", value: analytics.totalSent, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Opened", value: analytics.totalOpened, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Open Rate", value: `${analytics.openRate}%`, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Bounced", value: analytics.totalBounced, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Drafts", value: analytics.totalDrafts, color: "text-slate-400", bg: "bg-slate-500/10" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} border border-slate-800 rounded-xl p-4`}>
            <p className="text-xs text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart: Sent vs Opened (14 days) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-2">Sent vs Opened (Last 14 Days)</h2>
        <p className="text-xs text-slate-500 mb-6">
          <span className="inline-block w-3 h-3 rounded-sm bg-violet-500 mr-1 align-middle"></span> Sent
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-500 mr-1 ml-4 align-middle"></span> Opened
        </p>
        <div className="flex items-end gap-2 h-48">
          {analytics.dailyStats.map((day) => {
            const sentHeight = maxSent > 0 ? (day.sent / maxSent) * 100 : 0;
            const openedHeight = maxSent > 0 ? (day.opened / maxSent) * 100 : 0;
            const date = new Date(day.date + "T00:00:00");
            const dayLabel = date.toLocaleDateString("en-US", { weekday: "narrow" });
            const dateLabel = date.toLocaleDateString("en-US", { day: "numeric" });

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500">{day.sent > 0 ? day.sent : ""}</span>
                <div className="w-full flex gap-0.5 items-end" style={{ height: "140px" }}>
                  <div
                    className="flex-1 bg-violet-600/60 rounded-t transition-all"
                    style={{ height: `${Math.max(sentHeight, 2)}%` }}
                  />
                  <div
                    className="flex-1 bg-amber-500/60 rounded-t transition-all"
                    style={{ height: `${Math.max(openedHeight, 2)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">{dayLabel}</p>
                <p className="text-[10px] text-slate-600">{dateLabel}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Activity Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          {analytics.recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500">No email activity yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analytics.recentActivity.map((email) => (
                <div key={email.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                  {/* Status icon */}
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    email.opened ? "bg-amber-500/20" :
                    email.status === "sent" ? "bg-emerald-500/20" :
                    email.status === "bounced" ? "bg-red-500/20" :
                    "bg-slate-500/20"
                  }`}>
                    {email.opened ? (
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : email.status === "sent" ? (
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : email.status === "bounced" ? (
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{email.contactName}</p>
                      {email.campaign && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-violet-500/20 text-violet-400 rounded-full">{email.campaign.name}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{email.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        email.opened ? "bg-amber-500/20 text-amber-400" :
                        email.status === "sent" ? "bg-emerald-500/20 text-emerald-400" :
                        email.status === "bounced" ? "bg-red-500/20 text-red-400" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>
                        {email.opened ? "opened" : email.status}
                      </span>
                      {email.tone && (
                        <span className="text-[10px] text-slate-600">{email.tone}</span>
                      )}
                      <span className="text-[10px] text-slate-600">
                        {timeAgo(email.openedAt || email.sentAt || email.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Recipients */}
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Top Recipients</h2>
            {analytics.topRecipients.length === 0 ? (
              <p className="text-sm text-slate-500">No emails sent yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.topRecipients.map((r, idx) => (
                  <div key={r.email} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-4">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-300 text-xs font-bold flex-shrink-0">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{r.name}</p>
                      <p className="text-xs text-slate-500 truncate">{r.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-white">{r.sent} sent</p>
                      <p className="text-xs text-amber-400">{r.opened} opened</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campaign Performance */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Campaign Performance</h2>
            {analytics.campaignStats.length === 0 ? (
              <p className="text-sm text-slate-500">No campaigns yet</p>
            ) : (
              <div className="space-y-4">
                {analytics.campaignStats.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-white">{c.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        c.status === "sent" ? "bg-emerald-500/20 text-emerald-400" :
                        c.status === "active" ? "bg-blue-500/20 text-blue-400" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>{c.totalEmails} emails</span>
                      <span>{c.sent} sent</span>
                      <span>{c.opened} opened</span>
                      <span className="text-amber-400">{c.openRate}% open rate</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${c.openRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Delivery Funnel</h2>
        <div className="flex items-center gap-4">
          {[
            { label: "Composed", value: analytics.totalEmails, color: "bg-violet-500", width: 100 },
            { label: "Sent", value: analytics.totalSent, color: "bg-emerald-500", width: analytics.totalEmails > 0 ? (analytics.totalSent / analytics.totalEmails) * 100 : 0 },
            { label: "Delivered", value: analytics.totalSent - analytics.totalBounced, color: "bg-blue-500", width: analytics.totalEmails > 0 ? ((analytics.totalSent - analytics.totalBounced) / analytics.totalEmails) * 100 : 0 },
            { label: "Opened", value: analytics.totalOpened, color: "bg-amber-500", width: analytics.totalEmails > 0 ? (analytics.totalOpened / analytics.totalEmails) * 100 : 0 },
          ].map((step) => (
            <div key={step.label} className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">{step.label}</span>
                <span className="text-sm font-bold text-white">{step.value}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${step.color} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.max(step.width, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
