import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createTicketSchema = z.object({
  subject: z.string().min(3),
  summary: z.string().min(5),
  category: z.enum(["Technical", "Billing", "Account", "General"]).default("General"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  customerEmail: z.string().email(),
  customerName: z.string().optional(),
});

export async function GET(req: Request) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const priority = searchParams.get("priority") || undefined;
  const search = searchParams.get("search") || undefined;

  // Tenant-isolated ticket list
  const tickets = db.getTickets(auth.tenantId, { status, priority, search });

  // Attach customer details
  const enrichedTickets = tickets.map((t) => {
    const cust = db.getCustomerById(auth.tenantId, t.customerId);
    const assignedUser = t.assignedAgentId
      ? db.findUserById(auth.tenantId, t.assignedAgentId)
      : null;
    return {
      ...t,
      customer: cust ? { name: cust.name, email: cust.email } : null,
      assignedAgent: assignedUser ? { id: assignedUser.id, name: assignedUser.name } : null,
    };
  });

  return NextResponse.json({ tickets: enrichedTickets });
}

export async function POST(req: Request) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid ticket parameters" } },
        { status: 400 }
      );
    }

    const { subject, summary, category, priority, customerEmail, customerName } = parsed.data;
    const customer = db.findOrCreateCustomer(auth.tenantId, customerEmail, customerName);

    // Create empty conversation for the ticket
    const convId = `conv_${Date.now()}`;
    db.createConversation({
      id: convId,
      tenantId: auth.tenantId,
      customerId: customer.id,
      channel: "email",
      status: "escalated",
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          conversationId: convId,
          sender: "customer",
          content: summary,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const ticket = db.createTicket({
      id: `tkt_${Date.now().toString().slice(-4)}`,
      tenantId: auth.tenantId,
      conversationId: convId,
      customerId: customer.id,
      assignedAgentId: auth.user.id,
      subject,
      summary,
      status: "open",
      priority,
      category,
      sentimentScore: 0,
      sentimentLabel: "neutral",
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });

    db.addAuditLog({
      id: `audit_tkt_create_${Date.now()}`,
      tenantId: auth.tenantId,
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "TICKET_CREATED",
      target: ticket.id,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error("Create ticket error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create ticket" } },
      { status: 500 }
    );
  }
}
