"use client";

import React, { useState, useEffect } from "react";
import {
  Inbox,
  Search,
  Filter,
  Sparkles,
  Send,
  Lock,
  Globe,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Tag,
  Smile,
  Frown,
  Meh,
  CornerDownRight,
  RefreshCw,
} from "lucide-react";
import { Ticket, TicketStatus, TicketPriority } from "@/lib/types";

interface AgentInboxProps {
  initialTicketId?: string | null;
  agentName?: string;
  agentRole?: string;
}

export const AgentInbox: React.FC<AgentInboxProps> = ({
  initialTicketId,
  agentName = "Sarah Chen",
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialTicketId || null);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [replyBody, setReplyBody] = useState<string>("");
  const [isInternalNote, setIsInternalNote] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState<boolean>(false);

  // Fetch tickets for tenant
  const loadTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const token = localStorage.getItem("ecosphere_token") || "mock_dev_token";
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (searchQuery) params.append("search", searchQuery);

      // Using dev headers
      const res = await fetch(`/api/v1/tickets?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        if (!selectedTicketId && data.tickets?.length > 0) {
          setSelectedTicketId(data.tickets[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Load selected ticket details
  const loadTicketDetails = async (id: string) => {
    try {
      const token = localStorage.getItem("ecosphere_token") || "mock_dev_token";
      const res = await fetch(`/api/v1/tickets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTicketDetails(data.ticket);
      }
    } catch (err) {
      console.error("Failed to load ticket details:", err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, searchQuery]);

  useEffect(() => {
    if (selectedTicketId) {
      loadTicketDetails(selectedTicketId);
    }
  }, [selectedTicketId]);

  const handleSendReply = async (markResolved = false) => {
    if (!selectedTicketId || !replyBody.trim() || isSending) return;
    setIsSending(true);

    try {
      const token = localStorage.getItem("ecosphere_token") || "mock_dev_token";
      const res = await fetch(`/api/v1/tickets/${selectedTicketId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          body: replyBody,
          internal: isInternalNote,
          resolve: markResolved,
        }),
      });

      if (res.ok) {
        setReplyBody("");
        loadTicketDetails(selectedTicketId);
        loadTickets();
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyAISuggestion = () => {
    if (selectedTicketDetails?.aiSuggestedReply) {
      setReplyBody(selectedTicketDetails.aiSuggestedReply);
      setIsInternalNote(false);
    }
  };

  const cannedResponses = [
    "Thank you for contacting EcoSphere support. I'm actively reviewing your account quota now.",
    "Our refund policy covers 30 days from purchase. I have processed this request for you.",
    "Please try resetting your MFA device using one of your 16-character emergency recovery codes.",
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Support Agent Inbox
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {tickets.length} Tickets
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Assigned Agent: <strong className="text-slate-700">{agentName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subject, category..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => loadTickets()}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Refresh tickets"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3-Column Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[750px]">
        {/* Left Column: Ticket Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Filters Bar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No tickets match these filters.
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicketId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50/80 border-l-4 border-l-blue-600"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-slate-500">
                        #{t.id}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          t.priority === "urgent"
                            ? "bg-rose-100 text-rose-700"
                            : t.priority === "high"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate mb-1">
                      {t.subject}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                      {t.summary}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {t.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Conversation Thread & Reply Editor (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {selectedTicketDetails ? (
            <>
              {/* Ticket Thread Header */}
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 truncate max-w-xs">
                      {selectedTicketDetails.subject}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                      {selectedTicketDetails.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Customer: <strong>{selectedTicketDetails.customer?.name}</strong> ({selectedTicketDetails.customer?.email})
                  </p>
                </div>
              </div>

              {/* Message History Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                {selectedTicketDetails.messages?.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl text-xs leading-relaxed border ${
                      msg.isInternal
                        ? "bg-amber-50/80 border-amber-200 text-amber-950"
                        : msg.sender === "agent"
                        ? "bg-blue-50 border-blue-200 text-blue-950 ml-6"
                        : msg.sender === "customer"
                        ? "bg-white border-slate-200 text-slate-800 mr-6 shadow-2xs"
                        : "bg-indigo-50/60 border-indigo-100 text-indigo-950 mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 text-[10px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1">
                        {msg.isInternal ? (
                          <>
                            <Lock className="w-3 h-3 text-amber-600" />
                            <strong className="text-amber-700">Internal Team Note</strong>
                          </>
                        ) : msg.sender === "agent" ? (
                          <>
                            <User className="w-3 h-3 text-blue-600" />
                            <strong className="text-blue-700">Support Agent</strong>
                          </>
                        ) : msg.sender === "customer" ? (
                          <>
                            <User className="w-3 h-3 text-slate-500" />
                            <strong className="text-slate-700">Customer</strong>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <strong className="text-indigo-700">EcoSphere AI</strong>
                          </>
                        )}
                      </span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box Area */}
              <div className="p-3 border-t border-slate-200 bg-white space-y-2">
                {/* Note type toggle & canned responses */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsInternalNote(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        !isInternalNote
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Public Reply
                    </button>
                    <button
                      onClick={() => setIsInternalNote(true)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        isInternalNote
                          ? "bg-amber-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      Internal Note
                    </button>
                  </div>

                  {/* Canned dropdown */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setReplyBody((prev) => (prev ? `${prev}\n${e.target.value}` : e.target.value));
                      }
                    }}
                    className="text-[11px] bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-slate-700 focus:outline-none"
                  >
                    <option value="">Insert Canned Response...</option>
                    {cannedResponses.map((r, idx) => (
                      <option key={idx} value={r}>
                        {r.slice(0, 35)}...
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder={
                    isInternalNote
                      ? "Add an internal note only visible to support team..."
                      : "Type a reply to send to customer..."
                  }
                  rows={3}
                  className={`w-full p-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                    isInternalNote
                      ? "bg-amber-50/50 border-amber-300 focus:ring-amber-500"
                      : "bg-slate-50 border-slate-200 focus:ring-blue-500"
                  }`}
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    {isInternalNote ? "Private note: customer cannot see this" : "Customer will be notified"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSendReply(true)}
                      disabled={isSending || !replyBody.trim()}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-40"
                    >
                      Resolve & Send
                    </button>
                    <button
                      onClick={() => handleSendReply(false)}
                      disabled={isSending || !replyBody.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
              Select a ticket from the left queue to view conversation.
            </div>
          )}
        </div>

        {/* Right Column: AI Summary, Suggested Reply & Context (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              AI Copilot & Context
            </h3>
          </div>

          {selectedTicketDetails ? (
            <div className="space-y-4 flex-1 overflow-y-auto">
              {/* Sentiment Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Customer Sentiment
                </span>
                <div className="flex items-center gap-2 mt-1.5">
                  {selectedTicketDetails.sentimentLabel === "positive" ? (
                    <Smile className="w-5 h-5 text-emerald-500" />
                  ) : selectedTicketDetails.sentimentLabel === "negative" ? (
                    <Frown className="w-5 h-5 text-rose-500" />
                  ) : (
                    <Meh className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-800 capitalize">
                      {selectedTicketDetails.sentimentLabel}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      Score: {selectedTicketDetails.sentimentScore} (-1.0 to +1.0)
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Conversation Summary */}
              <div className="bg-indigo-50/70 border border-indigo-200/70 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Issue Summary</span>
                </div>
                <p className="text-xs text-indigo-950 leading-relaxed font-normal">
                  {selectedTicketDetails.summary}
                </p>
              </div>

              {/* AI Suggested Reply */}
              {selectedTicketDetails.aiSuggestedReply && (
                <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-blue-800">
                      AI Suggested Reply
                    </span>
                    <button
                      onClick={handleApplyAISuggestion}
                      className="text-[10px] font-semibold text-blue-700 hover:text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs flex items-center gap-1"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      Use Reply
                    </button>
                  </div>
                  <p className="text-xs text-blue-950 italic leading-relaxed">
                    &ldquo;{selectedTicketDetails.aiSuggestedReply}&rdquo;
                  </p>
                </div>
              )}

              {/* Customer Metadata */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Customer Profile
                </span>
                <div className="text-xs space-y-1 text-slate-600">
                  <p>
                    <strong>Name:</strong> {selectedTicketDetails.customer?.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedTicketDetails.customer?.email}
                  </p>
                  <p>
                    <strong>Account Plan:</strong> Enterprise Tier 1
                  </p>
                  <p>
                    <strong>SLA Status:</strong> Within Target (4h response)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-xs italic">
              AI analysis will appear here once a ticket is selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
