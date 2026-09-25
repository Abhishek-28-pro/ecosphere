import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateGroundedAnswer, analyzeSentiment, generateAgentAssist } from "@/lib/ai-service";
import { z } from "zod";

const chatMessageSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1).max(4000),
  tenantId: z.string().default("tenant_acme"),
  customerEmail: z.string().email().optional().default("customer@example.com"),
  customerName: z.string().optional().default("Customer"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = chatMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Message is invalid or exceeds 4000 characters." } },
        { status: 400 }
      );
    }

    const { message, tenantId, customerEmail, customerName } = parsed.data;
    let conversationId = parsed.data.conversationId;

    // Verify tenant exists
    const tenant = db.getTenant(tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Tenant not found." } },
        { status: 404 }
      );
    }

    // Customer setup
    const customer = db.findOrCreateCustomer(tenantId, customerEmail, customerName);

    // Get or create conversation
    let conv = conversationId ? db.getConversation(tenantId, conversationId) : null;
    const activeConversationId = conv ? conv.id : (conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
    if (!conv) {
      conv = db.createConversation({
        id: activeConversationId,
        tenantId,
        customerId: customer.id,
        channel: "widget",
        status: "active",
        createdAt: new Date().toISOString(),
        messages: [],
      });
    }

    // 1. Persist Customer Message
    const customerMsg = {
      id: `msg_${Date.now()}_cust`,
      conversationId: activeConversationId,
      sender: "customer" as const,
      content: message,
      createdAt: new Date().toISOString(),
    };
    db.addMessageToConversation(tenantId, activeConversationId, customerMsg);

    // 2. Analyze Sentiment
    const sentiment = analyzeSentiment(message);

    // 3. Generate Grounded AI Answer
    const aiResult = await generateGroundedAnswer({
      tenantId,
      userMessage: message,
      conversationHistory: conv.messages.map((m) => ({ sender: m.sender, content: m.content })),
    });

    // 4. Persist AI Message
    const aiMsg = {
      id: `msg_${Date.now()}_ai`,
      conversationId: activeConversationId,
      sender: "ai" as const,
      content: aiResult.answer,
      citations: aiResult.citations,
      createdAt: new Date().toISOString(),
    };
    db.addMessageToConversation(tenantId, activeConversationId, aiMsg);

    let createdTicketId: string | undefined;

    // 5. If escalated or low confidence, auto-create ticket for human agent
    if (aiResult.escalate) {
      db.updateConversationStatus(tenantId, activeConversationId, "escalated");

      // Auto-generate agent assistance & summary
      const kbArticles = db.getKBArticles(tenantId);
      const assist = generateAgentAssist(
        message.slice(0, 60),
        [customerMsg, aiMsg],
        kbArticles
      );

      const ticket = db.createTicket({
        id: `tkt_${Date.now().toString().slice(-4)}`,
        tenantId,
        conversationId: activeConversationId,
        customerId: customer.id,
        assignedAgentId: null,
        subject: message.length > 50 ? message.slice(0, 50) + "..." : message,
        summary: assist.summary,
        status: "open",
        priority: assist.suggestedPriority,
        category: assist.suggestedCategory,
        sentimentScore: sentiment.score,
        sentimentLabel: sentiment.label,
        aiSuggestedReply: assist.suggestedReply,
        createdAt: new Date().toISOString(),
        resolvedAt: null,
      });

      createdTicketId = ticket.id;
    }

    return NextResponse.json({
      conversationId: activeConversationId,
      reply: aiResult.answer,
      citations: aiResult.citations,
      confidence: aiResult.confidence,
      escalate: aiResult.escalate,
      sentiment,
      ticketId: createdTicketId,
    });
  } catch (error) {
    console.error("Chat message API error:", error);
    return NextResponse.json(
      { error: { code: "AI_ERROR", message: "Failed to process chat message." } },
      { status: 500 }
    );
  }
}
