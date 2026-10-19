import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveContext, isResponse } from "@/lib/api-helpers";
import { generateBiography } from "@/lib/ai-biography";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/persons/[id]/biography — genera una biografía con IA (P2, DEC-003).
 * Devuelve el texto para que el usuario lo revise; NO lo persiste.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;

  const person = await prisma.person.findFirst({
    where: { id, treeId: ctx.treeId },
    include: { anecdotes: true },
  });
  if (!person) {
    return NextResponse.json({ error: "Persona no encontrada." }, { status: 404 });
  }

  const result = await generateBiography({
    firstName: person.firstName,
    lastName: person.lastName,
    nickname: person.nickname,
    birthDate: person.birthDate?.toISOString() ?? null,
    birthPlace: person.birthPlace,
    deathDate: person.deathDate?.toISOString() ?? null,
    isLiving: person.isLiving,
    notes: person.notes,
    anecdotes: person.anecdotes.map((a) => ({
      title: a.title,
      body: a.body,
      type: a.type,
    })),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }
  return NextResponse.json({ biography: result.text, aiDisclosure: true });
}
