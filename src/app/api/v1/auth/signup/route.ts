import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signAccessToken } from "@/lib/auth";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  tenantName: z.string().optional(),
  role: z.enum(["admin", "agent"]).default("admin"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid registration parameters" } },
        { status: 400 }
      );
    }

    const { name, email, password, tenantName, role } = parsed.data;

    // Check if tenant exists or create new one
    const tenantId = `tenant_${Date.now().toString(36)}`;
    const tenant = {
      id: tenantId,
      name: tenantName || `${name}'s Organization`,
      plan: "starter" as const,
      createdAt: new Date().toISOString(),
    };

    // Save tenant
    const data = db.getTenant(tenantId);
    if (!data) {
      db.createTenant(tenant);
      // Create user
      const newUser = {
        id: `usr_${Date.now()}`,
        tenantId,
        email,
        name,
        passwordHash: hashPassword(password),
        role,
        createdAt: new Date().toISOString(),
      };

      db.createUser(newUser);

      const token = signAccessToken({
        userId: newUser.id,
        tenantId: newUser.tenantId,
        email: newUser.email,
        role: newUser.role,
      });

      return NextResponse.json({
        token,
        tenant,
        user: {
          id: newUser.id,
          tenantId: newUser.tenantId,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });
    }

    return NextResponse.json(
      { error: { code: "CONFLICT", message: "User already exists" } },
      { status: 409 }
    );
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
