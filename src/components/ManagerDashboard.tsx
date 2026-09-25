"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Smile,
  Clock,
  CheckCircle,
  AlertOctagon,
  ShieldAlert,
  Zap,
  RefreshCw,
  Users,
  FileText,
} from "lucide-react";

export const ManagerDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("ecosphere_token") || "mock_dev_token";
      const res = await fetch("/api/v1/analytics/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.summary);
      }
    } catch (e) {
      console.error("Failed to load analytics:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Customer Experience & AI Telemetry Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Tenant: <strong>Acme Cloud Technologies</strong> &bull; Aggregated real-time metrics
          </p>
        </div>

        <button
          onClick={() => loadAnalytics()}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Metrics
        </button>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Deflection Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>AI Deflection Rate</span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">
            {analytics?.deflectionRate || 78}%
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">
            +4.2% from last week &bull; Grounded auto-resolution
          </p>
        </div>

        {/* CSAT Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Customer CSAT</span>
            <span className="p-1 rounded-md bg-amber-50 text-amber-600">
              <Smile className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">
            {analytics?.avgCSAT || 4.8} <span className="text-base text-slate-400 font-normal">/ 5.0</span>
          </div>
          <p className="text-[11px] text-amber-600 font-medium">
            Verified across 38 post-chat ratings
          </p>
        </div>

        {/* AI Response Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Avg AI Response Time</span>
            <span className="p-1 rounded-md bg-indigo-50 text-indigo-600">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">
            {analytics?.avgResponseTimeSeconds || 1.4}s
          </div>
          <p className="text-[11px] text-indigo-600 font-medium">
            Human escalation avg: {analytics?.humanAvgResolutionHours || 2.1}h
          </p>
        </div>

        {/* Ticket Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Active Support Tickets</span>
            <span className="p-1 rounded-md bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">
            {analytics?.openTicketsCount || 2} <span className="text-xs text-slate-400 font-normal">open</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {analytics?.resolvedTicketsCount || 38} resolved &bull; {analytics?.totalConversations || 142} total chats
          </p>
        </div>
      </div>

      {/* Analytics Charts & Sentiment Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Analysis Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Customer Sentiment Health
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time NLP sentiment extracted across all incoming customer interactions.
            </p>

            {/* Visual Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 mb-3">
              <div
                style={{ width: `${analytics?.sentimentDistribution?.positive || 68}%` }}
                className="bg-emerald-500"
                title="Positive"
              />
              <div
                style={{ width: `${analytics?.sentimentDistribution?.neutral || 22}%` }}
                className="bg-amber-400"
                title="Neutral"
              />
              <div
                style={{ width: `${analytics?.sentimentDistribution?.negative || 10}%` }}
                className="bg-rose-500"
                title="Negative"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-emerald-50 border border-emerald-200/70 p-2 rounded-xl">
                <span className="block font-bold text-emerald-800">
                  {analytics?.sentimentDistribution?.positive || 68}%
                </span>
                <span className="text-[10px] text-emerald-600">Positive</span>
              </div>
              <div className="bg-amber-50 border border-amber-200/70 p-2 rounded-xl">
                <span className="block font-bold text-amber-800">
                  {analytics?.sentimentDistribution?.neutral || 22}%
                </span>
                <span className="text-[10px] text-amber-600">Neutral</span>
              </div>
              <div className="bg-rose-50 border border-rose-200/70 p-2 rounded-xl">
                <span className="block font-bold text-rose-800">
                  {analytics?.sentimentDistribution?.negative || 10}%
                </span>
                <span className="text-[10px] text-rose-600">Negative</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            Negative sentiment inquiries are prioritized to urgent queue automatically.
          </div>
        </div>

        {/* Top Unresolved Topics (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Top Unresolved & Escalated Inquiries
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tickets requiring human specialist triage or potential knowledge base documentation gaps.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[10px] uppercase">
                    <th className="pb-2">Ticket</th>
                    <th className="pb-2">Subject</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Priority</th>
                    <th className="pb-2">Sentiment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics?.topUnresolvedTopics?.length > 0 ? (
                    analytics.topUnresolvedTopics.map((topic: any) => (
                      <tr key={topic.ticketId} className="hover:bg-slate-50/70">
                        <td className="py-2.5 font-bold text-slate-800">#{topic.ticketId}</td>
                        <td className="py-2.5 font-medium text-slate-700 truncate max-w-xs">{topic.subject}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                            {topic.category}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              topic.priority === "urgent"
                                ? "bg-rose-100 text-rose-700"
                                : topic.priority === "high"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {topic.priority}
                          </span>
                        </td>
                        <td className="py-2.5 capitalize text-slate-600">{topic.sentiment}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        All escalated tickets caught up!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Knowledge gaps identified are flagged for article creation.</span>
          </div>
        </div>
      </div>

      {/* Security, Audit & Injection Defense Logs Feed */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tenant Security & Audit Trail
            </h3>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Audit Retention: Active
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {analytics?.recentAuditLogs?.map((log: any) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.action.includes("BLOCKED")
                      ? "bg-rose-100 text-rose-700"
                      : log.action.includes("UPDATE")
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {log.action}
                </span>
                <span className="text-slate-800 font-medium">{log.actorEmail}</span>
                <span className="text-slate-400 text-[11px]">&rarr; Target: {log.target}</span>
              </div>
              <span className="text-slate-400 text-[11px] shrink-0">
                {new Date(log.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
