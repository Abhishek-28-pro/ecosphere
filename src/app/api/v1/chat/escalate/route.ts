import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateAgentAssist } from "@/lib/ai-service";
import { z } from "zod";

const escalateSchema = z.object({
  conversationId: z.string(),
  tenantId: z.string().default("tenant_acme"),
  reason: z.string().optional().default("Customer requested human agent handoff"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = escalateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid parameters" } },
        { status: 400 }
      );
    }

    const { conversationId, tenantId, reason } = parsed.data;

    const conv = db.getConversation(tenantId, conversationId);
    if (!conv) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Conversation not found" } },
        { status: 404 }
      );
    }

    db.updateConversationStatus(tenantId, conversationId, "escalated");

    // Check if ticket already exists for this conversation
    const existingTickets = db.getTickets(tenantId);
    let ticket = existingTickets.find((t) => t.conversationId === conversationId);

    if (!ticket) {
      const kbArticles = db.getKBArticles(tenantId);
      const assist = generateAgentAssist(reason, conv.messages, kbArticles);

      ticket = db.createTicket({
        id: `tkt_${Date.now().toString().slice(-4)}`,
        tenantId,
        conversationId,
        customerId: conv.customerId,
        assignedAgentId: null,
        subject: `Escalation: ${reason.slice(0, 50)}`,
        summary: assist.summary,
        status: "open",
        priority: "medium",
        category: assist.suggestedCategory,
        sentimentScore: -0.2,
        sentimentLabel: "neutral",
        aiSuggestedReply: assist.suggestedReply,
        createdAt: new Date().toISOString(),
        resolvedAt: null,
      });
    }

    // Add confirmation message to conversation
    db.addMessageToConversation(tenantId, conversationId, {
      id: `msg_esc_${Date.now()}`,
      conversationId,
      sender: "ai",
      content: `I have escalated this conversation to our support engineering team (Ticket #${ticket.id}). An agent will review your full transcript and follow up shortly.`,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      status: "escalated",
      message: "Conversation successfully escalated to support queue.",
    });
  } catch (error) {
    console.error("Escalate API error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to escalate conversation" } },
      { status: 500 }
    );
  }
}
