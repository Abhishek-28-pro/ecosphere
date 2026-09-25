"use client";

import React, { useState } from "react";
import { HeaderNav, ActiveTab } from "@/components/HeaderNav";
import { HeroLanding } from "@/components/HeroLanding";
import { ChatWidget } from "@/components/ChatWidget";
import { AgentInbox } from "@/components/AgentInbox";
import { ManagerDashboard } from "@/components/ManagerDashboard";
import { KnowledgeBaseManager } from "@/components/KnowledgeBaseManager";
import { ArchitectureModal } from "@/components/ArchitectureModal";
import { MessageSquare, X } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("landing");
  const [currentRole, setCurrentRole] = useState<"admin" | "agent" | "customer">("customer");
  const [isFloatingWidgetOpen, setIsFloatingWidgetOpen] = useState(false);
  const [activeTicketIdForInbox, setActiveTicketIdForInbox] = useState<string | null>(null);

  const handleRoleChange = (role: "admin" | "agent" | "customer") => {
    setCurrentRole(role);
    if (role === "agent") {
      setActiveTab("inbox");
    } else if (role === "admin") {
      setActiveTab("dashboard");
    } else {
      setActiveTab("widget");
    }
  };

  const handleOpenTicketInInbox = (ticketId: string) => {
    setActiveTicketIdForInbox(ticketId);
    setCurrentRole("agent");
    setActiveTab("inbox");
    setIsFloatingWidgetOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f0ff] relative">
      {/* Top Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        tenantName="Acme Cloud Technologies"
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === "landing" && (
          <HeroLanding
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenWidget={() => setActiveTab("widget")}
          />
        )}

        {activeTab === "widget" && (
          <div className="py-6 px-4">
            <div className="max-w-4xl mx-auto text-center mb-6">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-100/70 px-3 py-1 rounded-full border border-indigo-200">
                Interactive Customer Support Widget
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 mb-2">
                Ask Questions Grounded in Verified Docs
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                Test the grounded answer generation, clickable citations, prompt injection defense, and automatic ticket escalation to human agents.
              </p>
            </div>
            <ChatWidget
              tenantId="tenant_acme"
              onOpenTicketInInbox={handleOpenTicketInInbox}
            />
          </div>
        )}

        {activeTab === "inbox" && (
          <AgentInbox
            initialTicketId={activeTicketIdForInbox}
            agentName="Sarah Chen"
            agentRole={currentRole}
          />
        )}

        {activeTab === "dashboard" && <ManagerDashboard />}

        {activeTab === "kb" && <KnowledgeBaseManager />}

        {activeTab === "architecture" && <ArchitectureModal />}
      </main>

      {/* Floating Widget Launcher (Visible on non-widget tabs) */}
      {activeTab !== "widget" && (
        <div className="fixed bottom-6 right-6 z-50">
          {isFloatingWidgetOpen ? (
            <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-300 w-[380px] sm:w-[420px] max-h-[85vh] flex flex-col bg-white">
              <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-white text-xs font-bold">
                <span>EcoSphere.AI Floating Widget</span>
                <button
                  onClick={() => setIsFloatingWidgetOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2">
                <ChatWidget
                  tenantId="tenant_acme"
                  onOpenTicketInInbox={handleOpenTicketInInbox}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsFloatingWidgetOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-3 rounded-full shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask EcoSphere AI</span>
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-6 px-4 bg-white/60 border-t border-slate-200/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            &copy; 2026 EcoSphere.AI &bull; AI-Powered Customer Experience Platform. Built for Hackathon Excellence.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span>SOC 2 Type II Certified</span>
            <span>&bull;</span>
            <span>GDPR Compliant</span>
            <span>&bull;</span>
            <span>Multi-Tenant Isolated (SEC-001)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
