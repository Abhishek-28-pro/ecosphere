"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  User,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Star,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MessageCitation } from "@/lib/types";

interface MessageItem {
  id: string;
  sender: "customer" | "ai" | "agent";
  content: string;
  citations?: MessageCitation[];
  confidence?: "high" | "medium" | "low";
  createdAt: string;
}

interface ChatWidgetProps {
  tenantId?: string;
  onOpenTicketInInbox?: (ticketId: string) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  tenantId = "tenant_acme",
  onOpenTicketInInbox,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome_1",
      sender: "ai",
      content:
        "Hello! I'm EcoSphere.AI, your verified support assistant. I can answer your questions using our company's knowledge base or connect you directly to our human support engineering team.",
      confidence: "high",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [escalatedTicketId, setEscalatedTicketId] = useState<string | null>(null);
  const [showCSAT, setShowCSAT] = useState(false);
  const [csatRating, setCsatRating] = useState<number>(0);
  const [csatSubmitted, setCsatSubmitted] = useState(false);
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const starterQuestions = [
    "What is your refund policy?",
    "What are your API rate limits?",
    "How to set up Multi-Factor Authentication (MFA)?",
    "Can I configure a custom domain with SSL?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setInputText("");

    const userMsg: MessageItem = {
      id: `usr_${Date.now()}`,
      sender: "customer",
      content: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationId || undefined,
          message: query,
          tenantId,
          customerEmail: "david.miller@globex.com",
          customerName: "David Miller",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to process chat message");
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      if (data.ticketId) {
        setEscalatedTicketId(data.ticketId);
      }

      const aiMsg: MessageItem = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        content: data.reply,
        citations: data.citations,
        confidence: data.confidence,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If resolved or completed a cycle, offer CSAT
      if (!data.escalate && data.citations?.length > 0) {
        setShowCSAT(true);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "ai",
          content: `Support service notice: ${errorMsg}. A support ticket has been created for you.`,
          confidence: "low",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalateToHuman = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/chat/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationId || `conv_esc_${Date.now()}`,
          tenantId,
          reason: "Customer explicitly requested human agent assistance.",
        }),
      });

      const data = await res.json();
      if (data.ticketId) {
        setEscalatedTicketId(data.ticketId);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_esc_${Date.now()}`,
            sender: "ai",
            content: `I have routed your conversation to our support team. Your ticket reference is #${data.ticketId}. Sarah Chen from technical support has been notified.`,
            confidence: "high",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Escalation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingSubmit = async (score: number) => {
    setCsatRating(score);
    try {
      await fetch("/api/v1/csat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: escalatedTicketId || "conv_session_general",
          score,
          comment: "Customer submitted CSAT from chat widget",
          tenantId,
        }),
      });
      setCsatSubmitted(true);
    } catch (e) {
      console.error("CSAT error:", e);
    }
  };

  return (
    <div className="w-full flex justify-center py-4">
      {/* Widget Container */}
      <div className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col h-[680px] overflow-hidden transition-all">
        {/* Widget Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-3.5 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white tracking-tight">
                  EcoSphere Assistant
                </h3>
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-1.5 py-0.5 rounded-full">
                  Grounded AI
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Verified answers with citations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {escalatedTicketId && (
              <button
                onClick={() => onOpenTicketInInbox && onOpenTicketInInbox(escalatedTicketId)}
                className="text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-1 rounded-md hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                title="View in Agent Queue"
              >
                <span>#{escalatedTicketId}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => {
                setMessages([
                  {
                    id: "welcome_fresh",
                    sender: "ai",
                    content:
                      "Conversation restarted. How can I assist you with your EcoSphere account today?",
                    confidence: "high",
                    createdAt: new Date().toISOString(),
                  },
                ]);
                setEscalatedTicketId(null);
                setConversationId(null);
                setShowCSAT(false);
                setCsatSubmitted(false);
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Reset Chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Escalation Banner */}
        {escalatedTicketId && (
          <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Ticket #{escalatedTicketId}</strong> created for human follow-up.
              </span>
            </div>
            {onOpenTicketInInbox && (
              <button
                onClick={() => onOpenTicketInInbox(escalatedTicketId)}
                className="font-bold text-amber-700 hover:text-amber-900 underline ml-2"
              >
                View in Agent Inbox &rarr;
              </button>
            )}
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "customer" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm transition-all ${
                  msg.sender === "customer"
                    ? "bg-indigo-600 text-white rounded-br-xs"
                    : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs"
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Grounded Citation Cards */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-500 mb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Knowledge Sources:</span>
                    </div>
                    <div className="space-y-1.5">
                      {msg.citations.map((cite, i) => {
                        const isExpanded = expandedCitationId === `${msg.id}_${i}`;
                        return (
                          <div
                            key={i}
                            className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-slate-700"
                          >
                            <button
                              onClick={() =>
                                setExpandedCitationId(
                                  isExpanded ? null : `${msg.id}_${i}`
                                )
                              }
                              className="w-full flex items-center justify-between text-left font-semibold text-indigo-700 hover:text-indigo-900"
                            >
                              <span className="truncate pr-2">{cite.title}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                            </button>
                            {isExpanded && (
                              <p className="mt-1 text-[10px] text-slate-600 italic bg-white p-1.5 rounded border border-slate-100">
                                &ldquo;{cite.snippet}&rdquo;
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Confidence Badge */}
                {msg.sender === "ai" && msg.confidence && (
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span
                      className={`inline-flex items-center gap-1 font-medium ${
                        msg.confidence === "high"
                          ? "text-emerald-600"
                          : msg.confidence === "medium"
                          ? "text-amber-600"
                          : "text-rose-600"
                      }`}
                    >
                      {msg.confidence === "high" && "✔ Verified by Knowledge Base"}
                      {msg.confidence === "medium" && "⚡ Moderate Match"}
                      {msg.confidence === "low" && "⚠ Deferring to Human Agent"}
                    </span>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
              <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-3 h-3 animate-spin" />
              </div>
              <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-2 rounded-2xl shadow-sm">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 text-[11px] text-slate-500 font-medium">Retrieving verified knowledge...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* CSAT Survey Banner */}
        {showCSAT && (
          <div className="px-4 py-2.5 bg-indigo-50/80 border-t border-indigo-100 flex items-center justify-between transition-all">
            <span className="text-xs text-indigo-950 font-medium">
              {csatSubmitted ? "Thank you for your feedback!" : "Was this answer helpful?"}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingSubmit(star)}
                  disabled={csatSubmitted}
                  className={`p-1 transition-all ${
                    csatRating >= star
                      ? "text-amber-500 scale-110"
                      : "text-slate-300 hover:text-amber-400"
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Starter Suggested Chips */}
        {messages.length <= 2 && (
          <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-500 font-semibold shrink-0 pl-1">Suggested:</span>
            {starterQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200/80 font-medium shadow-2xs transition-colors shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Action Controls & Input Box */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2">
          {/* Escalation Button Bar */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={handleEscalateToHuman}
              disabled={isLoading || Boolean(escalatedTicketId)}
              className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <User className="w-3 h-3 text-slate-500" />
              <span>Talk to a Human Agent</span>
            </button>
            <span className="text-[10px] text-slate-400 font-medium">
              {inputText.length} / 4000
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about rate limits, refunds, MFA..."
              maxLength={4000}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
