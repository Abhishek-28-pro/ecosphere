import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } },
      { status: 401 }
    );
  }

  const tenant = db.getTenant(auth.tenantId);

  return NextResponse.json({
    user: {
      id: auth.user.id,
      tenantId: auth.user.tenantId,
      email: auth.user.email,
      name: auth.user.name,
      role: auth.user.role,
    },
    tenant,
  });
}
