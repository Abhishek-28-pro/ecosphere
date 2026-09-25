import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, signAccessToken } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  tenantId: z.string().default("tenant_acme"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid email or password format" } },
        { status: 400 }
      );
    }

    const { email, password, tenantId } = parsed.data;
    const user = db.findUserByEmail(tenantId, email);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      // Generic security response to prevent user enumeration per Section 15
      return NextResponse.json(
        { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    const token = signAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    db.addAuditLog({
      id: `audit_login_${Date.now()}`,
      tenantId: user.tenantId,
      actorId: user.id,
      actorEmail: user.email,
      action: "USER_LOGIN_SUCCESS",
      target: "auth_service",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal authentication error" } },
      { status: 500 }
    );
  }
}
