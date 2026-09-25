import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { detectPromptInjection } from "@/lib/ai-service";
import { z } from "zod";

const articleSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(10),
  category: z.string().default("General"),
  visibility: z.enum(["public", "internal"]).default("public"),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId") || "tenant_acme";
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;

  const articles = db.getKBArticles(tenantId, { category, search });
  return NextResponse.json({ articles });
}

export async function POST(req: Request) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  // Check admin role
  if (auth.user.role !== "admin") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only administrators can manage the knowledge base" } },
      { status: 403 }
    );
  }

  try {
    const raw = await req.json();
    const parsed = articleSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Title and body are required." } },
        { status: 400 }
      );
    }

    const { title, body, category, visibility } = parsed.data;

    // Check for prompt injection patterns
    const injectionCheck = detectPromptInjection(body);

    const articleId = `art_${Date.now()}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newArticle = {
      id: articleId,
      tenantId: auth.tenantId,
      title,
      slug,
      body,
      category,
      visibility,
      version: 1,
      injectionRiskDetected: injectionCheck.isSuspicious,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveKBArticle(newArticle);

    db.addAuditLog({
      id: `audit_kb_create_${Date.now()}`,
      tenantId: auth.tenantId,
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "KB_ARTICLE_CREATED",
      target: articleId,
      details: {
        title,
        injectionRiskDetected: injectionCheck.isSuspicious,
      },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      article: newArticle,
      warning: injectionCheck.isSuspicious
        ? "Warning: Potential prompt instruction or override pattern detected in text."
        : undefined,
    }, { status: 201 });
  } catch (error) {
    console.error("Create KB article error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create article" } },
      { status: 500 }
    );
  }
}
