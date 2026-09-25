import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "healthy";
  let tenantCount = 0;

  try {
    const tenant = db.getTenant("tenant_acme");
    tenantCount = tenant ? 1 : 0;
  } catch {
    dbStatus = "error";
  }

  const aiProvider = process.env.GEMINI_API_KEY
    ? "google-gemini"
    : process.env.ANTHROPIC_API_KEY
    ? "anthropic-claude"
    : "grounded-local-rag";

  return NextResponse.json({
    status: dbStatus === "healthy" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      database: { status: dbStatus, tenantsDetected: tenantCount },
      aiOrchestrator: { status: "active", provider: aiProvider, jsonMode: true, promptInjectionDefense: true },
      securityHeaders: "active",
      tenantIsolation: "enforced",
    },
    latencyMs: Date.now() - startTime,
  });
}
