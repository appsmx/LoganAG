import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveContext, isResponse } from "@/lib/api-helpers";
import { nextInterviewQuestion, detectGaps } from "@/lib/ai-interview";
import { fullName } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const schema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .max(40)
    .default([]),
});

/**
 * POST /api/ai/interview — devuelve la siguiente pregunta de la entrevista guiada
 * (P2, DEC-003). No persiste nada; es una guía conversacional.
 */
export async function POST(req: NextRequest) {
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const persons = await prisma.person.findMany({
    where: { treeId: ctx.treeId },
    select: {
      firstName: true,
      lastName: true,
      birthDate: true,
      birthPlace: true,
    },
  });

  const mapped = persons.map((p) => ({
    name: fullName(p),
    birthDate: p.birthDate?.toISOString() ?? null,
    birthPlace: p.birthPlace,
  }));

  const result = await nextInterviewQuestion(
    {
      personNames: mapped.map((p) => p.name),
      gaps: detectGaps(mapped),
    },
    parsed.data.history
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }
  return NextResponse.json({
    question: result.question,
    hint: result.hint,
    aiDisclosure: true,
  });
}
