import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDate } from "@/lib/tree-service";
import { personCreateSchema } from "@/lib/validation";
import { resolveContext, isResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** GET /api/persons — lista de personas del árbol activo. */
export async function GET() {
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;

  const persons = await prisma.person.findMany({
    where: { treeId: ctx.treeId },
    orderBy: { firstName: "asc" },
  });
  return NextResponse.json({ persons });
}

/** POST /api/persons — crea una persona (requiere rol editor). */
export async function POST(req: NextRequest) {
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;
  if (!ctx.access.canEdit) {
    return NextResponse.json({ error: "Solo lectura." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = personCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const person = await prisma.person.create({
    data: {
      treeId: ctx.treeId,
      firstName: d.firstName,
      lastName: d.lastName ?? null,
      nickname: d.nickname ?? null,
      gender: d.gender,
      birthDate: parseDate(d.birthDate),
      birthPlace: d.birthPlace ?? null,
      deathDate: parseDate(d.deathDate),
      deathPlace: d.deathPlace ?? null,
      photoUrl: d.photoUrl ?? null,
      notes: d.notes ?? null,
      isLiving: d.isLiving,
    },
  });

  return NextResponse.json({ person }, { status: 201 });
}
