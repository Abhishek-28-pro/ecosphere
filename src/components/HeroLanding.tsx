"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle2,
  Zap,
  MessageSquare,
  Users,
  Database,
  Lock,
  ExternalLink,
} from "lucide-react";
import { ActiveTab } from "./HeaderNav";

interface HeroLandingProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenWidget: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onNavigate,
  onOpenWidget,
}) => {
  // CMS / Configurable state per Section 6
  const [headline] = useState("AI customer experience that never sleeps");
  const [subtext] = useState(
    "Ground every customer conversation in your verified knowledge base. Auto-resolve tier-1 tickets with citations, seamlessly escalate edge cases, and empower agents with AI-drafted replies."
  );

  return (
    <div className="w-full min-h-screen bg-[#f3f0ff] py-6 px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-start">
      {/* SECTION 6: The Single Large White Heavily-Rounded (20-24px) Card holding the Hero */}
      <section className="relative w-full max-w-6xl bg-white border border-slate-200/90 rounded-[22px] shadow-xl shadow-indigo-950/5 overflow-hidden p-6 sm:p-10 lg:p-12 mb-10 transition-all">
        {/* Soft Diagonal Multi-Color Blurred Gradient Blob (pink -> orange -> indigo -> blue) */}
        <div
          aria-hidden="true"
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[340px] sm:w-[540px] md:w-[680px] h-[320px] sm:h-[400px] bg-gradient-to-tr from-pink-400/25 via-amber-400/20 to-indigo-500/25 blur-3xl rounded-full pointer-events-none -z-0"
        />

        {/* Hero Navigation Bar inside the Card */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-10 border-b border-slate-100">
          {/* Logo mark: small rounded-square icon + wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">
              EcoSphere<span className="text-indigo-600">.AI</span>
            </span>
          </div>

          {/* Centered Pill-shaped segmented nav control */}
          <div className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-full border border-slate-200/80">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-900 shadow-sm cursor-default">
              Home
            </span>
            <button
              onClick={() => onNavigate("widget")}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              AI Widget
            </button>
            <button
              onClick={() => onNavigate("inbox")}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Agent Inbox
            </button>
            <button
              onClick={() => onNavigate("dashboard")}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Analytics
            </button>
            <button
              onClick={() => onNavigate("kb")}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Knowledge Base
            </button>
          </div>

          {/* Right auth CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("inbox")}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors px-2 py-1"
            >
              Sign in
            </button>
            <button
              onClick={() => onNavigate("dashboard")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-sm hover:shadow transition-all"
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Hero Center Body */}
        <div className="relative z-10 pt-12 pb-14 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/90 border border-indigo-200/70 text-indigo-700 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            Next-Gen RAG Grounding & Sentiment Triage
          </div>

          {/* Large Bold Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight max-w-3xl leading-[1.15] mb-6">
            {headline}
          </h1>

          {/* Centered Muted Subtext */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-[480px] mb-8 font-normal">
            {subtext}
          </p>

          {/* Primary CTA: Single Dark Pill Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onOpenWidget}
              className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white text-sm font-semibold px-7 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <span>Get started with Live AI</span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </button>
            <button
              onClick={() => onNavigate("inbox")}
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-6 py-3.5 rounded-full border border-slate-200 transition-all shadow-sm"
            >
              <span>Open Agent Triage Queue</span>
            </button>
          </div>

          {/* Trust points */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Multi-Tenant Isolated (SEC-001)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Backend-Only Gemini & JSON Mode</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Prompt Injection Guardrail</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>100% Verifiable Citations</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Hero Preview Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
          <div
            onClick={() => onNavigate("widget")}
            className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
              Embeddable AI Widget
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customer-facing widget providing instant answers with cited sources, sentiment detection, and smooth human escalation.
            </p>
          </div>

          <div
            onClick={() => onNavigate("inbox")}
            className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
              Unified Agent Inbox
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ticket queue with automated AI summaries, suggested replies, internal team notes, and category auto-triage.
            </p>
          </div>

          <div
            onClick={() => onNavigate("dashboard")}
            className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
              Manager Analytics
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time metrics: 78% AI deflection rate, CSAT tracking, response time analytics, and unresolved topic discovery.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Grounded RAG Engine
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Chunking + cosine vector similarity ensure responses strictly derive from approved articles. Zero hallucinations.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Prompt Injection Defense
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Adversarial override detection guards against jailbreaks in customer inputs and flagged knowledge base uploads.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Tenant Isolation (SEC-001)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Strict row-level tenancy. Inquiries across tenants return 404 Not Found to prevent data exposure or resource enumeration.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
            Instant Handoff
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Low-confidence queries or complex requests automatically create tickets populated with complete context for human agents.
          </p>
        </div>
      </section>
    </div>
  );
};
