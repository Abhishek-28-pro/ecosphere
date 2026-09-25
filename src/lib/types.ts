export type Role = "admin" | "agent";

export interface Tenant {
  id: string;
  name: string;
  plan: "starter" | "pro" | "enterprise";
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  externalId?: string;
  name: string;
  email: string;
  createdAt: string;
}

export type Channel = "widget" | "email" | "chat";
export type ConversationStatus = "active" | "escalated" | "resolved" | "closed";

export interface MessageCitation {
  articleId: string;
  title: string;
  snippet: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: "customer" | "ai" | "agent";
  content: string;
  citations?: MessageCitation[];
  isInternal?: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  tenantId: string;
  customerId: string;
  channel: Channel;
  status: ConversationStatus;
  createdAt: string;
  closedAt?: string;
  messages: Message[];
}

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface Ticket {
  id: string;
  tenantId: string;
  conversationId: string;
  customerId: string;
  assignedAgentId?: string | null;
  subject: string;
  summary: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: "Billing" | "Technical" | "Account" | "General";
  sentimentScore: number; // -1.0 to 1.0
  sentimentLabel: "positive" | "neutral" | "negative";
  aiSuggestedReply?: string;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface KBArticle {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  body: string;
  category: string;
  visibility: "public" | "internal";
  version: number;
  injectionRiskDetected?: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface KBEmbedding {
  id: string;
  articleId: string;
  tenantId: string;
  chunkText: string;
  vector: number[];
  createdAt: string;
}

export interface CSATRating {
  id: string;
  ticketId: string;
  tenantId: string;
  score: number; // 1 to 5
  comment?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  actorId: string;
  actorEmail: string;
  action: string;
  target: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface AIResponsePayload {
  answer: string;
  citations: MessageCitation[];
  confidence: "high" | "medium" | "low";
  escalate: boolean;
  reason?: string;
}
