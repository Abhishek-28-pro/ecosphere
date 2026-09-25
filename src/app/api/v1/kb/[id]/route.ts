import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { detectPromptInjection } from "@/lib/ai-service";
import { z } from "zod";

const updateArticleSchema = z.object({
  title: z.string().min(3).optional(),
  body: z.string().min(10).optional(),
  category: z.string().optional(),
  visibility: z.enum(["public", "internal"]).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId") || "tenant_acme";
  const { id } = await params;

  const article = db.getKBArticleById(tenantId, id);
  if (!article) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Article not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ article });
}

export async function PUT(
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

  if (auth.user.role !== "admin") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only administrators can edit the knowledge base" } },
      { status: 403 }
    );
  }

  const { id } = await params;
  const existing = db.getKBArticleById(auth.tenantId, id);
  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Article not found" } },
      { status: 404 }
    );
  }

  try {
    const raw = await req.json();
    const parsed = updateArticleSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid update fields" } },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const bodyToCheck = data.body || existing.body;
    const injectionCheck = detectPromptInjection(bodyToCheck);

    const updated = {
      ...existing,
      ...data,
      version: existing.version + 1,
      injectionRiskDetected: injectionCheck.isSuspicious,
      updatedAt: new Date().toISOString(),
    };

    db.saveKBArticle(updated);

    db.addAuditLog({
      id: `audit_kb_update_${Date.now()}`,
      tenantId: auth.tenantId,
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "KB_ARTICLE_UPDATED",
      target: id,
      details: { version: updated.version, injectionRiskDetected: injectionCheck.isSuspicious },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      article: updated,
      warning: injectionCheck.isSuspicious
        ? "Warning: Potential prompt instruction or override pattern detected in text."
        : undefined,
    });
  } catch (error) {
    console.error("Update KB article error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update article" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

  if (auth.user.role !== "admin") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only administrators can delete knowledge base articles" } },
      { status: 403 }
    );
  }

  const { id } = await params;
  const existing = db.getKBArticleById(auth.tenantId, id);
  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Article not found" } },
      { status: 404 }
    );
  }

  db.deleteKBArticle(auth.tenantId, id);

  db.addAuditLog({
    id: `audit_kb_del_${Date.now()}`,
    tenantId: auth.tenantId,
    actorId: auth.user.id,
    actorEmail: auth.user.email,
    action: "KB_ARTICLE_DELETED",
    target: id,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, message: "Article removed and re-indexed" });
}
