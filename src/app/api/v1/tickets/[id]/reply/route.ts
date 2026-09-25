import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const replySchema = z.object({
  body: z.string().min(1),
  internal: z.boolean().default(false),
  resolve: z.boolean().optional().default(false),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const ticket = db.getTicketById(auth.tenantId, id);

  if (!ticket) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Ticket not found" } },
      { status: 404 }
    );
  }

  try {
    const raw = await req.json();
    const parsed = replySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Message body is required" } },
        { status: 422 }
      );
    }

    const { body, internal, resolve } = parsed.data;

    const message = {
      id: `msg_agent_${Date.now()}`,
      conversationId: ticket.conversationId,
      sender: "agent" as const,
      content: body,
      isInternal: internal,
      createdAt: new Date().toISOString(),
    };

    db.addMessageToConversation(auth.tenantId, ticket.conversationId, message);

    const ticketUpdates: Record<string, unknown> = {};
    if (!ticket.assignedAgentId) {
      ticketUpdates.assignedAgentId = auth.user.id;
    }

    if (resolve) {
      ticketUpdates.status = "resolved";
      ticketUpdates.resolvedAt = new Date().toISOString();
      db.updateConversationStatus(auth.tenantId, ticket.conversationId, "resolved");
    } else if (ticket.status === "open") {
      ticketUpdates.status = "in_progress";
    }

    if (Object.keys(ticketUpdates).length > 0) {
      db.updateTicket(auth.tenantId, id, ticketUpdates);
    }

    db.addAuditLog({
      id: `audit_reply_${Date.now()}`,
      tenantId: auth.tenantId,
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: internal ? "TICKET_INTERNAL_NOTE_ADDED" : "TICKET_REPLY_SENT",
      target: id,
      details: { resolve, internal },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ticketId: id,
      messageId: message.id,
      status: resolve ? "resolved" : ticketUpdates.status || ticket.status,
    });
  } catch (error) {
    console.error("Ticket reply API error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to send reply" } },
      { status: 500 }
    );
  }
}
