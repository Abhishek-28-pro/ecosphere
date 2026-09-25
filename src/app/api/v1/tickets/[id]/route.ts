import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateTicketSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assignedAgentId: z.string().nullable().optional(),
});

export async function GET(
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

  // Tenant isolation: querying with auth.tenantId
  const ticket = db.getTicketById(auth.tenantId, id);

  // Return 404 (not 403) to prevent leaking resource existence per Section 14, 15, and SEC-001
  if (!ticket) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Ticket not found" } },
      { status: 404 }
    );
  }

  const customer = db.getCustomerById(auth.tenantId, ticket.customerId);
  const conversation = db.getConversation(auth.tenantId, ticket.conversationId);
  const assignedAgent = ticket.assignedAgentId
    ? db.findUserById(auth.tenantId, ticket.assignedAgentId)
    : null;

  return NextResponse.json({
    ticket: {
      ...ticket,
      customer,
      assignedAgent: assignedAgent ? { id: assignedAgent.id, name: assignedAgent.name, email: assignedAgent.email } : null,
      messages: conversation?.messages || [],
    },
  });
}

export async function PATCH(
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
    const body = await req.json();
    const parsed = updateTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid update fields" } },
        { status: 400 }
      );
    }

    const updates = parsed.data;
    if (updates.status === "resolved" || updates.status === "closed") {
      (updates as Record<string, unknown>).resolvedAt = new Date().toISOString();
      db.updateConversationStatus(auth.tenantId, ticket.conversationId, "resolved");
    }

    const updated = db.updateTicket(auth.tenantId, id, updates);

    db.addAuditLog({
      id: `audit_tkt_patch_${Date.now()}`,
      tenantId: auth.tenantId,
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "TICKET_UPDATED",
      target: id,
      details: updates,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ticket: updated });
  } catch (error) {
    console.error("Update ticket error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update ticket" } },
      { status: 500 }
    );
  }
}
