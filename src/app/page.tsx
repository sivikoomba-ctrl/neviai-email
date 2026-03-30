"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Email {
  id: string;
  contactName: string;
  contactEmail: string;
  subject: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

interface Analytics {
  totalEmails: number;
  totalSent: number;
  totalOpened: number;
  totalCampaigns: number;
  openRate: number;
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentEmails, setRecentEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsRes, emailsRes] = await Promise.all([
          fetch("/api/analytics"),
          fetch("/api/emails"),
        ]);
        const analyticsData = await analyticsRes.json();
        const emailsData = await emailsRes.json();
        setAnalytics(analyticsData);
        setRecentEmails(Array.isArray(emailsData) ? emailsData.slice(0, 5) : []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Emails",
      value: analytics?.totalEmails ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: "violet",
    },
    {
      label: "Sent",
      value: analytics?.totalSent ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      color: "emerald",
    },
    {
      label: "Open Rate",
      value: `${analytics?.openRate ?? 0}%`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      color: "amber",
    },
    {
      label: "Active Campaigns",
      value: analytics?.totalCampaigns ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: "blue",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", iconBg: "bg-violet-500/20" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", iconBg: "bg-emerald-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", iconBg: "bg-amber-500/20" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", iconBg: "bg-blue-500/20" },
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome to your AI Email Automation hub</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const colors = colorMap[stat.color];
          return (
            <div
              key={stat.label}
              className={`${colors.bg} border border-slate-800 rounded-xl p-6 transition-all duration-200 hover:border-slate-700`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${colors.iconBg} ${colors.text} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Emails */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Emails</h2>
          <Link
            href="/compose"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Compose New
          </Link>
        </div>
        {recentEmails.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-400">No emails yet. Start by composing one!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentEmails.map((email) => (
              <div
                key={email.id}
                className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-violet-400">
                      {email.contactName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {email.contactName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {email.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      email.status === "sent"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {email.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(email.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
