import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  const tenantId = searchParams.get("tenantId") || "tenant_acme";

  if (!conversationId) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "conversationId is required" } },
      { status: 400 }
    );
  }

  const conv = db.getConversation(tenantId, conversationId);
  if (!conv) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Conversation not found" } },
      { status: 404 }
    );
  }

  // Filter out internal notes for customer view
  const publicMessages = conv.messages.filter((m) => !m.isInternal);

  return NextResponse.json({
    conversation: {
      id: conv.id,
      channel: conv.channel,
      status: conv.status,
      createdAt: conv.createdAt,
      closedAt: conv.closedAt,
      messages: publicMessages,
    },
  });
}
