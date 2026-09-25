import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  // Manager/Admin or Agent viewing telemetry
  const summary = db.getAnalyticsSummary(auth.tenantId);
  const auditLogs = db.getAuditLogs(auth.tenantId).slice(0, 10);
  const csatList = db.getCSATRatings(auth.tenantId);

  return NextResponse.json({
    summary: {
      ...summary,
      recentRatings: csatList.slice(-5),
      recentAuditLogs: auditLogs,
    },
  });
}
