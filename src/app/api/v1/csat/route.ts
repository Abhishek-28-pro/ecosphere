import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const csatSchema = z.object({
  ticketId: z.string(),
  score: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  tenantId: z.string().default("tenant_acme"),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = csatSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Score between 1 and 5 is required" } },
        { status: 400 }
      );
    }

    const { ticketId, score, comment, tenantId } = parsed.data;

    const rating = db.addCSATRating({
      id: `csat_${Date.now()}`,
      ticketId,
      tenantId,
      score,
      comment,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, rating });
  } catch (error) {
    console.error("CSAT submission error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to record CSAT rating" } },
      { status: 500 }
    );
  }
}
