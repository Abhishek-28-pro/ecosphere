"use client";

import React from "react";
import {
  Sparkles,
  MessageSquare,
  Inbox,
  BarChart3,
  BookOpen,
  ShieldCheck,
  Building2,
  UserCheck,
} from "lucide-react";

export type ActiveTab =
  | "landing"
  | "widget"
  | "inbox"
  | "dashboard"
  | "kb"
  | "architecture";

interface HeaderNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentRole: "admin" | "agent" | "customer";
  setCurrentRole: (role: "admin" | "agent" | "customer") => void;
  tenantName: string;
  onOpenAuthModal?: () => void;
  currentUser?: { name: string; email: string; role: string } | null;
  onSignOut?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  tenantName,
  onOpenAuthModal,
  currentUser,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-3 pb-2 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 bg-white/95 border border-slate-200/90 shadow-sm rounded-2xl px-4 py-2.5 transition-all">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab("landing")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-lg">
                EcoSphere<span className="text-indigo-600">.AI</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                CX Platform
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {tenantName}
            </p>
          </div>
        </div>

        {/* Center Pill Navigation */}
        <nav className="flex items-center bg-slate-100/90 p-1 rounded-full border border-slate-200/70 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("landing")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "landing"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab("widget")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "widget"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            AI Widget
          </button>
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "inbox"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-blue-500" />
            Agent Inbox
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "dashboard"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("kb")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "kb"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "architecture"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
            Architecture & Security
          </button>
        </nav>

        {/* Persona & Role Switcher */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{currentUser.role}</p>
              </div>
              <button
                onClick={onSignOut}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 px-2 py-0.5 rounded hover:bg-rose-50 transition-colors"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-2xs transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Sign in
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-lg p-1 text-[11px]">
            <span className="text-slate-400 pl-1 font-medium flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-slate-500" />
              Role:
            </span>
            <select
              value={currentRole}
              onChange={(e) =>
                setCurrentRole(e.target.value as "admin" | "agent" | "customer")
              }
              className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="customer">End Customer</option>
              <option value="agent">Support Agent (Sarah)</option>
              <option value="admin">Support Admin (Eleanor)</option>
            </select>
          </div>

          <button
            onClick={() => setActiveTab("widget")}
            className="hidden sm:inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-sm hover:shadow transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Try Live AI
          </button>
        </div>
      </div>
    </header>
  );
};
